// 🔥 FIREBASE – TU CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyCrXnHPcq9J__LWAH7yCd__CtC77MitZ2A",
    authDomain: "dani-peluqueria.firebaseapp.com",
    databaseURL: "https://dani-peluqueria-default-rtdb.firebaseio.com",
    projectId: "dani-peluqueria",
    storageBucket: "dani-peluqueria.firebasestorage.app",
    messagingSenderId: "733641745768",
    appId: "1:733641745768:web:b8f771ddf387ccb037a2dd"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
let ordenes = [];

// 🔄 CARGA DESDE FIREBASE
db.ref("ordenes_taller").on("value", snapshot => {
    const data = snapshot.val();
    ordenes = data ? Object.values(data) : [];
    render();
});

// ➕ NUEVA ORDEN
function nuevaOrden() {
    const d = new Date();
    ordenes.push({
        id: Date.now(),
        numero: ordenes.length + 1,
        cliente: "",
        telefono: "",
        equipo: "",
        falla: "",
        fallaOpcion: "",
        precio: 0,
        fechaIngreso: d.toISOString().split("T")[0],
        fechaEntrega: "",
        estado: false
    });
    render();
}

// 🧾 RENDER TABLA
function render() {
    const tbody = document.getElementById("tabla");
    tbody.innerHTML = "";
    const filtro = document.getElementById("buscarCliente").value.toLowerCase();

    ordenes
      .filter(o => o.cliente.toLowerCase().includes(filtro))
      .sort((a,b)=>a.numero-b.numero)
      .forEach((o,i)=>{
        tbody.innerHTML += `
<tr>
<td>${o.numero}</td>
<td><input type="text" value="${o.cliente}" onchange="ordenes[${i}].cliente=this.value"></td>
<td><input type="tel" value="${o.telefono}" onchange="ordenes[${i}].telefono=this.value"></td>
<td><input type="text" value="${o.equipo}" onchange="ordenes[${i}].equipo=this.value"></td>

<td>
<select onchange="seleccionFalla(${i}, this.value)">
<option value="">--Seleccionar--</option>
<option value="Encerado" ${o.fallaOpcion==="Encerado"?'selected':''}>Encerado</option>
<option value="Afilado" ${o.fallaOpcion==="Afilado"?'selected':''}>Afilado</option>
<option value="Montaje" ${o.fallaOpcion==="Montaje"?'selected':''}>Montaje</option>
<option value="Arreglo de base" ${o.fallaOpcion==="Arreglo de base"?'selected':''}>Arreglo de base</option>
<option value="Otros" ${o.fallaOpcion==="Otros"?'selected':''}>Otros</option>
</select>
<input type="text" style="width:90%; margin-top:4px;" value="${o.falla}" ${o.fallaOpcion==="Montaje"||o.fallaOpcion==="Otros"?'':'disabled'} oninput="ordenes[${i}].falla=this.value">
</td>

<td><input type="number" value="${o.precio}" onchange="ordenes[${i}].precio=Number(this.value)"></td>
<td><input type="date" value="${o.fechaIngreso}" onchange="ordenes[${i}].fechaIngreso=this.value"></td>
<td><input type="date" value="${o.fechaEntrega}" onchange="ordenes[${i}].fechaEntrega=this.value"></td>

<td>
<div class="acciones">
  <div>
    <button onclick="imprimir(${i})">🖨️</button>
    <button onclick="borrar(${i})">✕</button>
  </div>
  <div>
    <button onclick="enviarWhatsapp(${i})">📲</button>
    <input type="checkbox" ${o.estado?'checked':''} onchange="ordenes[${i}].estado=this.checked">
  </div>
</div>
</td>

</tr>`;
    });
}

// 📝 FALLA
function seleccionFalla(index, valor) {
    ordenes[index].fallaOpcion = valor;
    const fila = document.getElementById("tabla").rows[index];
    const inputFalla = fila.cells[4].querySelector("input[type=text]");
    if(valor==="Montaje" || valor==="Otros"){
        inputFalla.disabled = false;
    } else {
        inputFalla.disabled = true;
        inputFalla.value = "";
        ordenes[index].falla = "";
    }
}

// 💾 GUARDAR
function guardar() {
    db.ref("ordenes_taller").set(ordenes)
      .then(()=>alert("✅ Guardado"))
      .catch(()=>alert("❌ Error"));
}

// ✖ BORRAR
function borrar(i) {
    if(confirm("Borrar orden?")){
        ordenes.splice(i,1);
        reordenarNumeros();
        render();
    }
}

// 🔢 REORDENAR NÚMEROS
function reordenarNumeros() {
    ordenes.forEach((o,i)=>o.numero=i+1);
}

// 📲 WHATSAPP
function enviarWhatsapp(i){
    const o = ordenes[i];
    if(!o.telefono) return alert("Falta teléfono");
    const mensaje = `Hola ${o.cliente}, tu equipo (${o.equipo}) ya está listo.`;
    window.open(`https://wa.me/${o.telefono.replace(/\D/g,'')}?text=${encodeURIComponent(mensaje)}`,'_blank');
}

// 🖨️ IMPRIMIR
function imprimir(i){
    const o = ordenes[i];
    const line = "================================";
    let fallaTexto = (o.fallaOpcion==="Montaje" || o.fallaOpcion==="Otros") ? `${o.fallaOpcion} – ${o.falla}` : o.fallaOpcion;
    const texto = `
${line}
         TALLER - ORDEN N° ${o.numero}
${line}
Cliente:        ${o.cliente}
Teléfono:       ${o.telefono}

Equipo:         ${o.equipo}
Reparación:     ${fallaTexto}
Precio:         $${o.precio}

Fecha Ingreso:  ${o.fechaIngreso.split('-').reverse().join('-')}
Fecha Entrega:  ${o.fechaEntrega.split('-').reverse().join('-')}
Estado:         ${o.estado?'✔️ Listo':'🛠️ En reparación'}
${line}
      ¡Gracias por elegirnos!
${line}
`;
    const ventana = window.open('','_blank','width=400,height=600');
    ventana.document.write(`
<html>
  <head><title>Imprimir</title></head>
  <body>
    <pre style="font-family: monospace; font-size: 13px; white-space: pre-wrap;">${texto}</pre>
  </body>
</html>
`);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
}
