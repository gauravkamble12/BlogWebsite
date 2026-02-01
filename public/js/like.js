document.addEventListener("click", async e => {
  if (!e.target.classList.contains("like-btn")) return;

  const btn = e.target;
  const blogId = btn.dataset.blog;

  btn.classList.add("animate");

  const res = await fetch(`/like/${blogId}/ajax`, { method: "POST" });
  const data = await res.json();

  btn.querySelector(".like-count").innerText = data.count;

  setTimeout(() => btn.classList.remove("animate"), 400);
});
