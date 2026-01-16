async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

async function displayUser() {
  const user = await fetchUserData(1);
  console.log(user);
}

fetchUserData(1)
  .then(user => console.log(user))
  .catch(err => console.error(err));
