const initialState = {
  prospects: [],
  likes: [],
  matches: [],
};
const GET_PROSPECTS = 'GET_PROSPECTS';
const GET_LIKES = 'GET_LIKES';
const SEND_LIKE = 'SEND_LIKE';
const UNLIKE = 'UNLIKE';
const REMOVE_AWAIT = 'REMOVE_AWAIT';

const gotProspects = prospects => ({ type: GET_PROSPECTS, prospects });
const gotLikes = likes => ({ type: GET_LIKES, likes });
const sentLike = prospectId => ({ type: SEND_LIKE, prospectId });
const unLike = prospectId => ({ type: UNLIKE, prospectId });
const removedAwait = prospectId => ({ type: REMOVE_AWAIT, prospectId });

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
    let response;
    if (currentUser.data().preferences.gender === 'Everyone') {
      response = users;
    } else {
      response = await users.where(
        'gender',
        '==',
        currentUser.data().preferences.gender
      );
    }
    const userPreferences = await response
      .where('age', '>=', currentUser.data().preferences.age[0])
      .where('age', '<=', currentUser.data().preferences.age[1])
      .get();

    //filter user prospects by the preferences of each prospect. The user should match
    //those prospect's preferences
    const prospects = [];
    userPreferences.forEach(doc => {
      if (
        doc.data().preferences.gender ===
        currentUser.data().gender || 'Everyone'
      ) {
        if (
          doc.data().preferences.age[0] <= currentUser.data().age &&
          doc.data().preferences.age[1] >= currentUser.data().age
        ) {
          prospects.push({
            userId: doc.id,
            name: doc.data().name,
            age: doc.data().age,
            gender: doc.data().gender,
            imageUrl: doc.data().imageUrl,
            height: doc.data().height,
            codeChallenge: doc.data().codeChallenge,
            favoriteLang: doc.data().favoriteLang,
          });
        }
      }
    });
    //cross reference with who the user has already liked
    const userLikes = await firestore
      .collection('userLikes')
      .doc(currentUser.id)
      .get();
    const filteredProspects = prospects.filter(prospect => {
      let id = prospect.userId;
      //if prospectId is already in current user's liked collection, it will be removed from prospects
      //also filter self from prospects
      return userLikes.data()[id] === undefined && id !== currentUser.id;
    });
    const { likes } = getState().likes;
    const likesIds = likes.map(like => like.userId);
    const finalProspects = filteredProspects.filter(prospect => {
      return !likesIds.includes(prospect.userId);
    });
    dispatch(gotProspects(finalProspects));
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
    const userLikes = await firestore
      .collection('userLikes')
      .doc(userId)
      .get();
    const filteredLikes = likes.filter(user => {
      let id = user.userId;
      return userLikes.data()[id] === undefined;
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
    const { firebase } = getState();
    const user = firebase.profile;
    const userId = firebase.auth.uid;
    const userData = {
      userId: userId || null,
      name: user.name || null,
      age: user.age || null,
      gender: user.gender || null,
      imageUrl: user.imageUrl || null,
      message: message || null,
    };
    await firestore
      .collection('userLikes')
      .doc(userId)
      .update({ [prospectId]: true });
    const prospectUser = await firestore
      .collection('likesUser')
      .doc(prospectId)
      .collection('likes');
    await prospectUser.doc(userId).set(userData);
    dispatch(sentLike(prospectId));
  } catch (err) {
    console.error(err);
  }
};

export const sendUnlike = prospectId => async (
  dispatch,
  getState,
  { getFirestore }
) => {
  try {
    const firestore = getFirestore();
    const { firebase } = getState();
    const userId = firebase.auth.uid;
    await firestore
      .collection('userLikes')
      .doc(userId)
      .update({ [prospectId]: false });
    dispatch(unLike(prospectId));
  } catch (err) {
    console.error(err);
  }
};

export const removeAwait = prospectId => async (
  dispatch,
  getState,
  { getFirestore }
) => {
  try {
    const firestore = getFirestore();
    const { firebase } = getState();
    const userId = firebase.auth.uid;
    await firestore
      .collection('userLikes')
      .doc(userId)
      .update({ [prospectId]: false });
    dispatch(removedAwait(prospectId));
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
    case REMOVE_AWAIT:
      const newLikes = state.likes.filter(
        prospect => prospect.userId !== action.prospectId
      );
      return { ...state, likes: [...newLikes] };
    default:
      return state;
  }
};

export default likesReducer;
