const initialState = {
  prospects: [],
  likes: [],
  matches: [],
};
const GET_PROSPECTS = 'GET_PROSPECTS';
const GET_LIKES = 'GET_LIKES';
//const GET_MATCHES = 'GET_MATCHES';
const SEND_LIKE = 'SEND_LIKE';
const UNLIKE = 'UNLIKE';

const gotProspects = prospects => ({ type: GET_PROSPECTS, prospects });
const gotLikes = likes => ({ type: GET_LIKES, likes });
//const gotMatches = matches => ({ type: GET_MATCHES, matches });
const sentLike = prospectId => ({ type: SEND_LIKE, prospectId });
export const unLike = prospectId => ({ type: UNLIKE, prospectId });

//cross reference likesUser to remove whomever they've already liked from prospects list, and should also
//keep track of who they've disliked and cross ref that as well
export const getProspects = userId => async (
  dispatch,
  getState,
  { getFirestore }
) => {
  try {
    const firestore = getFirestore();
    const users = await firestore.collection('users');
    const currentUser = await firestore.doc(`/users/${userId}`).get();
    const response = await users.where(
      'gender',
      '==',
      currentUser.data().preferences.gender
    );
    const age = await response
      .where('age', '>=', currentUser.data().preferences.age[0])
      .where('age', '<=', currentUser.data().preferences.age[1])
      .get();
    const prospects = [];
    age.forEach(doc => {
      prospects.push({
        userId: doc.id,
        name: doc.data().name,
        age: doc.data().age,
        gender: doc.data().gender,
        imageUrl: doc.data().imageUrl,
      });
    });
    //cross reference with who the user has already liked
    const userLikes = await firestore.collection('userLikes').doc(currentUser.id).get();
    const filteredProspects = prospects.filter(prospect => {
      let id = prospect.userId;
      //if prospectId is already in current user's liked collection, it will be removed from prospects
      return !userLikes.data()[id];
    });
    dispatch(gotProspects(filteredProspects));
  } catch (err) {
    console.error(err);
  }
};

export const getLikes = userId => async (
  dispatch,
  getState,
  { getFirestore }
) => {
  try {
    const firestore = getFirestore();
    const likes = [];
    const data = await firestore
      .collection('likesUser')
      .doc(userId)
      .collection('likes')
      .get();
    data.forEach(doc => {
      likes.push({
        userId: doc.id,
        name: doc.data().name,
        age: doc.data().age,
        gender: doc.data().gender,
        imageUrl: doc.data().imageUrl,
        message: doc.data().message || null,
      });
    });
    //cross reference userLikes, as they should now be displayed in chat
    const userLikes = await firestore.collection('userLikes').doc(userId).get();
    const filteredLikes = likes.filter(user => {
      let id = user.userId;
      return !userLikes.data()[id];
    });
    //once chat is up and running, dispatch filteredLikes
    dispatch(gotLikes(filteredLikes));
  } catch (err) {
    console.error(err);
  }
};
export const sendLike = (prospectId, message) => async (
  dispatch,
  getState,
  { getFirestore }
) => {
  try {
    const firestore = getFirestore();
    const { users } = getState();
    const user = users.user;
    console.log('message in sendLike', message);
    const userData = {
      userId: user.id || null,
      name: user.name || null,
      age: user.age || null,
      gender: user.gender || null,
      imageUrl: user.imageUrl || null,
      message: message || null,
    };
    await firestore
      .collection('userLikes')
      .doc(user.id).update({ [prospectId]: true });
    console.log('prospectId:', prospectId);
    const prospectUser = await firestore
      .collection('likesUser')
      .doc(prospectId)
      .collection('likes');
    await prospectUser.doc(user.id).set(userData);
    dispatch(sentLike(prospectId));
  } catch (err) {
    console.error(err);
  }
};

//reducer
const likesReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_PROSPECTS:
      return { ...state, prospects: [...action.prospects] };
    case GET_LIKES:
      return { ...state, likes: [...action.likes] };
    case SEND_LIKE:
      const removed = state.prospects.filter(
        prospect => prospect.userId !== action.prospectId
      );
      return { ...state, prospects: [...removed] };
    case UNLIKE:
      const removeUser = state.prospects.filter(
        prospect => prospect.userId !== action.prospectId
      );
      return { ...state, prospects: [...removeUser] };
    default:
      return state;
  }
};

export default likesReducer;