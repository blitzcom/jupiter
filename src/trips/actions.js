import * as types from './types'
import { db } from '../firebase'

export const createRequest = () => ({
  type: types.CREATE_REQUEST,
})

export const createSuccess = id => ({
  type: types.CREATE_SUCCESS,
  id: id,
})

export const createFailure = () => ({
  type: types.CREATE_FAILURE,
})

export const createAsync = () => {
  return async dispatch => {
    try {
      dispatch(createRequest())

      const tripKey = db
        .ref()
        .child('trips')
        .push().key

      await db.ref('trips/' + tripKey).set({ state: 'pending' })

      dispatch(createSuccess(tripKey))
    } catch (e) {
      console.log(e)
      dispatch(createFailure())
    }
  }
}

export const cancelRequest = () => ({
  type: types.CANCEL_REQUEST,
})

export const cancelSuccess = () => ({
  type: types.CANCEL_SUCCESS,
})

export const cancelFailure = () => ({
  type: types.CANCEL_FAILURE,
})

export const cancelAsync = id => {
  return async dispatch => {
    try {
      dispatch(cancelRequest())

      await db.ref('trips/' + id).remove()

      dispatch(cancelSuccess())
    } catch (e) {
      console.log(e)
      dispatch(cancelFailure())
    }
  }
}

export const add = trip => ({
  type: types.ADD,
  trip: trip,
})

export const update = trip => ({
  type: types.UPDATE,
  trip: trip,
})

export const remove = trip => ({
  type: types.REMOVE,
  trip: trip,
})

const tripFromSnapshot = snapshot => {
  return Object.assign({}, snapshot.val(), { id: snapshot.key })
}

export const fetchTrips = () => {
  return dispatch => {
    const tripsRef = db.ref('trips')

    tripsRef.on('child_added', snapshot => {
      dispatch(add(tripFromSnapshot(snapshot)))
    })

    tripsRef.on('child_changed', snapshot => {
      dispatch(update(tripFromSnapshot(snapshot)))
    })

    tripsRef.on('child_removed', snapshot => {
      dispatch(remove(tripFromSnapshot(snapshot)))
    })

    return tripsRef
  }
}
