import { SagaIterator } from 'redux-saga';
import { Action, Success } from 'typescript-fsa';
import { takeEvery, put, call, select, take, all } from 'redux-saga/effects';

import * as auth from 'modules/auth';
import * as account from 'modules/account';
import * as transaction from 'modules/transaction';
import * as ecosystem from 'modules/ecosystem';

export function* attachNewEcosystemWorker(
  action: Action<Success<any, any>>
): SagaIterator {
  const uniqKey: string = yield select(auth.selectors.getCurrentAccount);

  if (action.payload.params.contract === 'NewEcosystem') {
    const ecosystemId: string = action.payload.result.id;

    yield all([
      put(account.actions.attachEcosystem({ uniqKey, ecosystemId })),
      put(ecosystem.actions.requestEcosystem.started({ ecosystems: [ecosystemId] }))
    ]);
  }
}

export function* requestNewEcosystemWorker(action: Action<any>) {
  yield put(
    ecosystem.actions.requestEcosystem.started({
      ecosystems: [action.payload.ecosystem_id],
    })
  );
}

export default function* EcosystemSaga(): SagaIterator {
  yield takeEvery(
    transaction.actions.runTransaction.done,
    attachNewEcosystemWorker
  );
  yield takeEvery(auth.actions.attachSession, requestNewEcosystemWorker);
}
