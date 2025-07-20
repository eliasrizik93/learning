import { useState } from 'react';

export default function ChatPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  const createUser = async () => {
    if (!email) return alert('Email is required!');
    await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    alert('User created!');
    setEmail('');
    setName('');
  };

  const getUsers = async () => {
    const res = await fetch('http://localhost:3000/users');
    const data = await res.json();
    setUsers(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create User</h2>
      <input
        placeholder='Email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder='Name (optional)'
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={createUser} style={{ border: '1px solid black' }}>
        Create
      </button>
      <button onClick={getUsers}>Get Users</button>

      <h3>All Users:</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.email} - {user.name || 'No name'}
          </li>
        ))}
      </ul>
    </div>
  );
}
