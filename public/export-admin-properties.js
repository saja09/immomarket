const raw = localStorage.getItem("immomarket_admin_properties");
if (!raw) {
  console.log("NO_ADMIN_PROPERTIES_FOUND");
} else {
  console.log(raw);
}
