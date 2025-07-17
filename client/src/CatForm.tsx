import React, { useState } from 'react';

export interface Cat {
  name: string;
  age: number;
  breed: string;
}

async function createCat(cat: Cat): Promise<void> {
  const response = await fetch('http://localhost:3000/api/cats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cat),
  });

  if (!response.ok) {
    throw new Error(`Failed to create cat: ${response.statusText}`);
  }
}

const CatForm: React.FC = () => {
  const [cat, setCat] = useState<Cat>({
    name: '',
    age: 0,
    breed: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCat({ ...cat, [name]: name === 'age' ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCat(cat);
      alert('Cat saved successfully!');
      setCat({ name: '', age: 0, breed: '' });
    } catch (error) {
      alert('Failed to save cat.');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name='name'
        value={cat.name}
        onChange={handleChange}
        placeholder='Name'
        required
      />
      <input
        name='age'
        type='number'
        value={cat.age}
        onChange={handleChange}
        placeholder='Age'
        required
      />
      <input
        name='breed'
        value={cat.breed}
        onChange={handleChange}
        placeholder='Breed'
        required
      />
      <button type='submit'>Save Cat</button>
    </form>
  );
};

export default CatForm;
