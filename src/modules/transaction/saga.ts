import { Action } from 'typescript-fsa';
import { SagaIterator, delay } from 'redux-saga';
import { takeEvery, put, call, select, fork, take, race, cancel } from 'redux-saga/effects';
import { Alert } from 'react-native';
import { requestPrivateKeyWorker, refreshPrivateKeyExpireTime } from '../sagas/privateKey';
import { ModalTypes } from '../../constants';

import * as auth from 'modules/auth';
import * as applicationActions from 'modules/application/actions';
import api from 'utils/api';
import Keyring from 'utils/keyring';
import { runTransaction, checkTransactionStatus, confirmNestedContracts, setTransactions } from './actions';
import { getTransactions } from './selectors';
import { getPrivateKey } from 'modules/application/selectors';

class StatusError extends Error {}
export interface IPrepareData {
  forsign: string;
  signs?: {
    forsign: string;
    field: string;
  }[];
}

function* getTransactionStatus(hash: string) {
  while (true) {
    const response = yield call(api.transactionStatus, hash);

    yield put(checkTransactionStatus(response.data));

    if (response.data.errmsg) {
      throw new StatusError(response.data.errmsg);
    }

    if (response.data.blockid) {
      return response;
    }

    yield call(delay, 1500);
  }
}

export function* signsWorker(prepareData: IPrepareData, params: any, privateKey: string, transactionUuid: string): SagaIterator {
  let fullForsign = prepareData.forsign;
  const signParams: any = {};

  if (prepareData.signs) {
    for (const el of prepareData.signs) {
      yield put(applicationActions.showModal({ type: ModalTypes.CONTRACT, params: {
        ...el,
        ...params
      }})); // modal, where user can confirm or cancel signing of nested contracts

      const result = yield race({
        confirm: take(applicationActions.confirmModal),
        cancel: take(applicationActions.closeModal),
      });

      if (result.confirm) {
        signParams[el.field] = yield call(signNestedContractsWorker, el, privateKey);
        fullForsign += `,${signParams[el.field]}`;
        yield put(applicationActions.closeModal());
      }

      if (result.cancel) {
        yield call(filterTransactions, transactionUuid);
        return;
      }
    }
  }
  yield put(confirmNestedContracts({ fullForsign, signParams }));
}

export function* signNestedContractsWorker(sign: { forsign: string } , privateKey: string): SagaIterator {
  try {
    const signature = yield call(Keyring.sign, sign.forsign, privateKey); // signing nested contract
    return signature;
  } catch(err) {
    console.error(err, 'ERROR AT => getSignParamsWorker');
  }
}

export function* filterTransactions(transactionToDelete: string): SagaIterator {
  let transactions = yield select(getTransactions);
  for (let key in transactions) {
    if (key === transactionToDelete) {
      delete transactions[key];
    }
  }
  yield put(setTransactions(transactions)); // removing transaction which was canceled
}

export function* contractWorker(action: Action<any>): SagaIterator {
  try {
    const getKey = yield call(requestPrivateKeyWorker);
    if (!getKey) {
      yield call(filterTransactions, action.payload.uuid);
      return; // if no no key we need to clear transactions
    }

    const { privateKey } = getKey;
    const { data: prepareData } = yield call(
      api.prepareContract,
      action.payload.contract,
      action.payload.params
    ); // Prepate contract

    yield fork(signsWorker, prepareData, { ...action.payload.params, ...action.payload.contract }, privateKey, action.payload.uuid); // checking if there is nested contracts

    const signingResult = yield race({
      valid: take(confirmNestedContracts),
      invalid: take(setTransactions)
    });

    if (signingResult.valid) {
      const { fullForsign, signParams } = signingResult.valid.payload;
      const publicKey = yield select(auth.selectors.getPublicKey);

      const signature = yield call(Keyring.sign, fullForsign, privateKey); // generate the signature

      const { data: contractData } = yield call(
        api.runContract,
        action.payload.contract,
        {
          ...action.payload.params,
          signature,
          time: prepareData.time,
          ...signParams,
          pubkey: publicKey
        }
      ); // run contract

      const { data: statusData } = yield call(
        getTransactionStatus,
        contractData.hash
      ); // checking status of contract

      yield put(
        runTransaction.done({
          params: action.payload,
          result: {
            id: statusData.result,
            block: statusData.blockid
          }
        })
      );
      yield call(refreshPrivateKeyExpireTime);
    }

    if (signingResult.invalid) {
      yield put(applicationActions.closeModal());
      return;
    }
  } catch (error) {
    yield put(
      runTransaction.failed({
        params: action.payload,
        error
      })
    );
  }
}

export function* pageSaga(): SagaIterator {
  yield takeEvery(runTransaction.started, contractWorker);
}

export default pageSaga;
