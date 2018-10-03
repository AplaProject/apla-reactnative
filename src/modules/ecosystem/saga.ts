import { SagaIterator } from 'redux-saga';
import { Action } from 'typescript-fsa';
import { takeEvery, put, call } from 'redux-saga/effects';

import api, { apiSetToken, apiDeleteToken } from 'utils/api';
import Keyring from 'utils/keyring';

import { requestEcosystem } from './actions';
import { getUsername, loginCall } from 'modules/sagas/sagaHelpers';
import { uniqKeyGenerator } from 'utils/common';

const defaultParams: string[] = ['ava', 'key_mask', 'name'];

export function* requestEcosystemWorker(action: Action<any>) {

  try {
    const { ecosystems } = action.payload;

    for (const ecosystemId of ecosystems) {
      const { data: { ecosystem_name }} = yield call(api.getEcosystemName, ecosystemId);
      const { data: parameters } = yield call(
        api.getEcosystemParameters,
        ecosystemId,
        defaultParams,
        ecosystem_name
      );

      yield put(
        requestEcosystem.done({
          params: action.payload ,
          result: { id: ecosystemId, parameters: {...parameters, ecosystem_name} },
        })
      );
    }
  } catch (error) {
    yield put(
      requestEcosystem.failed({
        params: action.payload,
        error
      })
    );
  }
}

export function* checkEcosystemsAvailiability(payload: { ecosystems?: string[], privateKey: string, publicKey: string }) {
  try {
    const { privateKey, publicKey } = payload;
    const ecosystems = payload.ecosystems || ['1'];

    let availableEcosystems: { [key: string]: any } = {};

    for (let ecosystem of ecosystems) {
      try {
        let accountData = yield call(loginCall, { ecosystems: [ecosystem], private: payload.privateKey, public: payload.publicKey });

        const roles = accountData.roles || [];

        const avatarAndUsername = yield call(getUsername, accountData.token, accountData.key_id);
        const uniqKey = uniqKeyGenerator(accountData);

        accountData = { ...accountData, ...avatarAndUsername, roles, uniqKey, publicKey };
        availableEcosystems[uniqKey] = accountData;
        yield call(apiDeleteToken)
      } catch(err) {
        console.log('checkEcosystemsAvailiability err', err); // we just want to skip an invalid ecosystems
      }
    }
    return availableEcosystems;
  } catch(err) {
    console.error(err);
  }

}

export function* ecosystemSaga(): SagaIterator {
  yield takeEvery(requestEcosystem.started, requestEcosystemWorker);
}

export default ecosystemSaga;
