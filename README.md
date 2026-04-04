<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/arrow-left-right.svg" width="80" height="80" alt="Truekio Logo"/>
  <br/>
  <h1>🔄 Truekio: A Modern Framework for Circular Economy and AI-Driven Bartering Systems</h1>
  <p><strong>Juan Esteban Gómez Bernal</strong></p>
  <p><i>Preprint - Draft Version</i></p>
  <br/>

  [![React](https://img.shields.io/badge/React-19.0.0-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-12.11-FFCA28.svg?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
</div>

<hr/>

## Abstract

La economía circular ha emergido como un paradigma necesario frente al consumo lineal y el desperdicio. Este documento presenta **Truekio**, una plataforma de intercambio de bienes de consumo (bartering) impulsada por tecnologías web modernas y asistida por Inteligencia Artificial. A través de una arquitectura basada en React 19 y Firebase, Truekio ofrece una solución descentralizada y local para el trueque de artículos. Se detalla la implementación de su sistema de autenticación, su motor de mensajería en tiempo real, su reciente actualización de diseño (UI/UX) basada en paradigmas de *glassmorphism* y gradientes, y su estructura base de integración con Modelos Fundacionales a través de Google AI Studio / Gemini.

---

## 1. Introduction

Históricamente, el trueque fue la base del comercio humano antes de la adopción del dinero fiduciario. Hoy, las tecnologías de la información permiten escalar este modelo a niveles hiperlocales e hiperconectados. **Truekio** es una plataforma diseñada desde cero para facilitar estos intercambios, minimizando la fricción transaccional sin necesidad de una moneda intermedia.

El propósito de este proyecto, desarrollado por **Juan Esteban Gómez Bernal**, es ofrecer una aplicación web escalable y robusta que permita:
1. Publicar artículos con facilidad.
2. Descubrir oportunidades de trueque hiperlocales a través de filtrado dinámico.
3. Negociar intercambios a través de un chat en tiempo real seguro.
4. Fomentar el compromiso del usuario a través de un sistema de "Challenges" (Retos).

A nivel visual, el aplicativo ha recibido una actualización profunda orientada a una retención de usuario óptima, implementando un diseño inmersivo y altamente pulido.

<div align="center">
<img width="800" alt="Truekio Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
<br/>
<i>Figura 1. Vista de la aplicación desplegada con integración en AI Studio.</i>
</div>

## 2. System Architecture

El sistema adopta una arquitectura *Serverless* que delega la capa de almacenamiento y estado al ecosistema Firebase, permitiendo una experiencia de usuario rápida y resiliente.

### 2.1. Frontend: React 19 & Vite
El cliente se compila y empaqueta utilizando **Vite** para garantizar tiempos de Hot Module Replacement (HMR) casi instantáneos y un *bundle* final minimizado. Se emplea **React 19** aprovechando sus últimos hooks y capacidades de concurrencia. El enrutamiento de vistas se gestiona mediante `react-router-dom`.

### 2.2. Backend as a Service (BaaS): Firebase
La persistencia de datos y gestión de usuarios recae en Firebase:
*   **Firestore:** Base de datos NoSQL documental utilizada para sincronizar el estado en tiempo real. Colecciones principales: `users`, `items`, `chats`, y `challenges`. Las Reglas de Seguridad (Security Rules v2) aseguran que los usuarios no puedan auto-modificar métricas sensibles como `reputation` o `verified`.
*   **Authentication:** Proceso de Login delegando identidades a Google OAuth (Identity Provider).

### 2.3. AI Integration: Gemini / Google AI Studio
El framework está configurado para conectarse al modelo fundacional Gemini, inyectando capacidades de análisis semántico sobre los *listings* (anuncios) y permitiendo, en etapas futuras, un sistema de recomendación o "matchmaking" inteligente de trueques.

## 3. UI/UX Refactor and Modern Aesthetics

Una reciente actualización ha transformado radicalmente la Experiencia de Usuario (UX) y la Interfaz Gráfica (UI), alejándose de esquemas planos para adoptar tendencias contemporáneas:

*   **Glassmorphism & Blurring:** El sistema de navegación principal (`Navbar` y `Header`) utiliza propiedades de `backdrop-blur` combinadas con transparencias (`bg-white/80` y `bg-white/90`) para simular la textura del cristal, proporcionando una sensación de profundidad.
*   **Gradients & Depth:** La tipografía principal y los *Call-to-Action* (CTAs) emplean gradientes de alto contraste (`from-indigo-600 to-purple-600`), junto a sombras difusas acentuadas (`shadow-[0_8px_30px_...]`).
*   **Micro-interactions:** Todos los elementos interactivos, en particular las tarjetas de artículos (Item Cards), incluyen transiciones de escala (`hover:scale-110`), revelación progresiva de superposiciones oscuras (`opacity-100 transition-opacity`) e indicadores de "Subasta" radiantes.
*   **Iconography:** Integración de la biblioteca `lucide-react` garantizando consistencia semántica e isotópica.

## 4. Local Deployment Instructions

Para los investigadores y desarrolladores que deseen compilar, ejecutar y testear el sistema localmente, el proceso requiere Node.js (v18+) y una instancia activa de Firebase y Google AI Studio.

### 4.1. Instalación
Clone el repositorio y recupere las dependencias del proyecto:
```bash
# Instalación de dependencias manejadas en package-lock.json
npm install
```

### 4.2. Configuración de Entorno
Es imperativo configurar el ambiente local mediante el archivo `.env.local`. Este archivo debe residir en la raíz y contener la API Key otorgada por Google Gemini para habilitar el motor lógico subyacente.
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4.3. Inicialización del Servidor
Para lanzar el *Dev Server* de Vite y probar la aplicación en la dirección `http://localhost:3000`:
```bash
npm run dev
```

### 4.4. Code Quality & Linting
El repositorio aplica un control estricto de sintaxis y tipos estáticos mediante TypeScript:
```bash
npm run lint
```

## 5. Conclusion and Future Work

Truekio demuestra que la combinación de React, micro-servicios serverless y estética avanzada pueden revitalizar economías hiperlocales estancadas. El trabajo futuro planteado por **Juan Esteban Gómez Bernal** incluye el perfeccionamiento del motor de inferencia Gemini para automatizar la valoración monetaria intrínseca de los objetos y calcular dinámicamente "Tramos Justos" (Fair Trades) entre usuarios.

---

<div align="center">
  <b>Generado e Implementado por Bot BABYLON.IA</b> <br/>
  <i>Framework Experimental para Economía de Trueque</i>
</div>
