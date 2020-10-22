/* eslint-disable */
import axios from 'axios';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url = type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
      console.log('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    console.log('error', err.response.data.message);
  }
};
