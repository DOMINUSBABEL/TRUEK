<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/arrow-left-right.svg" width="100" height="100" alt="Truekio Logo"/>
  <br/>
  <h1>🔄 Truekio</h1>
  <p><strong>Tus cosas son tu moneda. Intercambia sin dinero.</strong></p>

  [![React](https://img.shields.io/badge/React-19.0.0-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-12.11-FFCA28.svg?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
</div>

<hr/>

## ✨ ¿Qué es Truekio?

**Truekio** es una plataforma interactiva de economía circular que te permite intercambiar objetos que ya no usas por otros que necesitas, **¡sin usar dinero!** Fomentamos el consumo responsable y ayudamos a reducir el desperdicio conectando a personas de la misma comunidad.

<div align="center">
<img width="800" alt="Truekio Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
<br/>
<i>Vista de tu aplicación impulsada por IA</i>
</div>

## 🚀 Características Principales

*   **🔍 Exploración Inteligente:** Encuentra fácilmente artículos cerca de ti mediante búsquedas avanzadas y filtros por categoría (Electrónica, Moda, Hogar, etc.) de manera fluida y en tiempo real.
*   **➕ Publicación Rápida y Sencilla:** Sube fotos de tus objetos, añade una descripción y publícalos en segundos. ¡Tu basura puede ser el tesoro de otra persona!
*   **💬 Chat Integrado:** Comunícate en tiempo real con otros usuarios para negociar los detalles, establecer puntos de encuentro y cerrar el trato con éxito de manera segura.
*   **🏆 Sistema de Retos (Challenges):** Participa en dinámicas divertidas de intercambio dentro de la plataforma para conseguir insignias y beneficios.
*   **👤 Perfil Personalizado:** Administra tus artículos activos, revisa tu historial de intercambios, actualiza tu información y mantén un registro de tus trueques.

## 🛠️ Tecnologías

Truekio está construido utilizando herramientas de vanguardia para asegurar un rendimiento óptimo y una experiencia de usuario excepcional:

*   **Frontend:** React 19, React Router, Tailwind CSS (Estilizado rápido y responsivo)
*   **Backend & Auth:** Firebase (Authentication, Firestore, Storage en tiempo real)
*   **Integración IA:** Integrado con AI Studio / Gemini
*   **Tooling:** Vite (Empaquetado súper rápido), TypeScript

## 💻 Instalación y Uso Local

¿Quieres probar Truekio en tu propia máquina o contribuir al proyecto? Sigue estos pasos para arrancar el entorno de desarrollo:

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior)
- Una cuenta de [Firebase](https://firebase.google.com/) para configurar la base de datos y la autenticación.
- API Key de Gemini (para funciones de AI Studio).

### Guía de inicio rápido

1. **Instala las dependencias del proyecto:**
   ```bash
   npm install
   ```

2. **Configura las variables de entorno:**
   Crea o modifica el archivo `.env.local` en la raíz del proyecto para incluir tus credenciales. Asegúrate de añadir tu clave de Gemini:
   ```env
   GEMINI_API_KEY=tu_gemini_api_key
   ```
   *(Nota: Asegúrate de tener configurado tu entorno de Firebase en el código fuente).*

3. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **¡Disfruta!**
   La aplicación estará disponible localmente. Ábrela en tu navegador (por defecto en `http://localhost:3000` o la URL que te indique la consola) para interactuar con la plataforma.

---

<div align="center">
  <b>Hecho con ❤️ para fomentar la economía circular y el intercambio comunitario.</b>
</div>
