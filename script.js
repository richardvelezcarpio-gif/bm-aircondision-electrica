
const nav=document.querySelector('.nav'), hamb=document.querySelector('.hamb');
if(hamb){hamb.addEventListener('click',()=>nav.classList.toggle('open'))}
function sendWhatsApp(e){
 e.preventDefault();
 const f=e.target;
 const name=f.name.value.trim(), phone=f.phone.value.trim(), service=f.service.value, msg=f.message.value.trim();
 const es=document.documentElement.lang==='es';
 const text=es
 ? `Hola BM Air & Electric, mi nombre es ${name}. Teléfono: ${phone}. Servicio: ${service}. Detalles: ${msg}`
 : `Hello BM Air & Electric, my name is ${name}. Phone: ${phone}. Service needed: ${service}. Details: ${msg}`;
 window.open('https://wa.me/19293060344?text='+encodeURIComponent(text),'_blank');
}
