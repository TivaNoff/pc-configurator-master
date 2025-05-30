// public/js/components.js
export async function fetchProductsByCategory(category) {
  const token = localStorage.getItem("token");
  if (!token) return (location.href = "/login.html");

  const res = await fetch(
    `/api/components?category=${encodeURIComponent(category)}&limit=0`,
    {
      headers: { Authorization: "Bearer " + token },
    }
  );
  const json = await res.json();
  return json.data || [];
}
