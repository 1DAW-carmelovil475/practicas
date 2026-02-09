
const codigoProvincia = "28"; // código de la provincia que quieres consultar
const url = `https://api.el-tiempo.net/json/v3/provincias/${codigoProvincia}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    const ciudad = data.ciudades[0]; // asumimos que la primera ciudad es la que quieres
    document.getElementById("clima").innerHTML = `
      <strong>Provincia:</strong> ${data.provincia.NOMBRE_PROVINCIA} <br>
      <strong>Ciudad:</strong> ${ciudad.name} <br>
      <strong>Estado del cielo:</strong> ${ciudad.stateSky.description} <br>
      <strong>Temp mínima:</strong> ${ciudad.temperatures.min} °C <br>
      <strong>Temp máxima:</strong> ${ciudad.temperatures.max} °C
    `;
  })
  .catch(() => {
    document.getElementById("clima").innerText = "Error al cargar datos";
  });