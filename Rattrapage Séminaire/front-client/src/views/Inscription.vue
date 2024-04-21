<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const registrationMessage = ref('');

async function register() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value || !emailRegex.test(email.value)) {
    registrationMessage.value = 'Veuillez saisir une adresse email valide.';
    return;
  }

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{12,}$/;
  if (!password.value || !passwordRegex.test(password.value)) {
    registrationMessage.value = 'Le mot de passe doit contenir au moins 12 caractères, une lettre majuscule, une lettre minuscule et un chiffre.';
    return;
  }

  const newUser = {
    mail: email.value,
    password: password.value,
  };

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });

    if (response.ok) {
      registrationMessage.value = 'Inscription réussie, attendez 2 secondes s\'il vous plaît';
      setTimeout(() => {
        router.push('/connexion');
      }, 2000);
    } else {
      registrationMessage.value = 'Échec de l\'inscription. Adresse Email déjà utilisée.';
    }
  } catch (error) {
    console.error('Une erreur s\'est produite lors de l\'inscription', error);
    registrationMessage.value = 'Une erreur s\'est produite lors de l\'inscription. Veuillez réessayer plus tard.';
  }
}

</script>

<template>
  <section class="bg-white">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div class="w-full rounded-xl shadow dark:border md:mt-0 sm:max-w-md xl:p-0 bg-gray-800 ">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 class="text-center text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Inscription
          </h1>
          <div class="space-y-4 md:space-y-6">
            <div>
              <label for="email"  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
              <input v-model="email" required type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="exemple@gmail.com">
            </div>
            <div>
              <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mot de passe</label>
              <input v-model="password" required type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" autocomplete="current-password">
            </div>
            <div class="flex items-center justify-between">
            </div>
            <button @click="register()" type="submit" class="bg-gray-500 hover:bg-white hover:text-black w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">S'inscrire</button>
            <p class="text-center text-sm font-light text-gray-500 dark:text-gray-400">{{ registrationMessage }}</p>
            <p class="text-center text-sm font-light text-gray-500 dark:text-gray-400">
              Vous avez déjà un compte ? <RouterLink to="/connexion" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Se connecter</RouterLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
