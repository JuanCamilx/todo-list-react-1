// src/api.js
const API_URL = "http://localhost:5000/api/tasks";

export async function getTasks() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function createTask(title) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });
  return res.json();
}

export async function toggleTask(id, completed) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed })
  });
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });
  return res.json();
}
