import { useAuth } from '../context/AuthProvider';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  
  return(
    <>
      {isAuthenticated && <h1>Welcome, {user.name}</h1>}
      <h1>Dash</h1>
    </>
  );
}

export default Dashboard