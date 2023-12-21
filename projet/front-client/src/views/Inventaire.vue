<script setup lang="ts">
import { ref } from 'vue';

const isAddingCard = ref(false);
const existingCards = ref([]);

const newCard = ref({
  name: '',
  marque: '',
  taille: '',
});

const addCard = () => {
  isAddingCard.value = true;
};

const saveCard = async () => {
  const response = await fetch('/api/ajout/cards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newCard.value),
  });

  if (response.ok) {
    console.log('Carte ajoutée avec succès');
    newCard.value = { name: '', marque: '', taille: '' };
    isAddingCard.value = false;
  } else {
    console.log("Échec de l'ajout de la carte");
  }
};

const loadExistingCards = async () => {
  const response = await fetch('/api/cards');

  if (response.ok) {
    existingCards.value = await response.json();
  } else {
    console.log("Échec du chargement des cartes existantes");
  }
};

loadExistingCards();
</script>

<template>
  <section class="antialiased bg-gray-100 text-gray-600 h-screen px-4">
    <div class="flex flex-col justify-center h-full">
      <div class="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-sm border border-gray-200">
        <header class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="font-semibold text-gray-800 text-2xl">MyStock</h2>
          <button class="text-right bg-gray-500 px-4 py-2 border rounded  text-white hover:text-black hover:bg-white shadow">Supprimer</button>
          <button class="text-right bg-gray-500 px-4 py-2 border rounded  text-white hover:text-black hover:bg-white shadow">Modifier</button>
          <button @click="addCard" class="text-right bg-gray-500 px-4 py-2 border rounded  text-white hover:text-black hover:bg-white shadow">Ajouter</button>
        </header>

        <div class="p-3">
          <div class="overflow-x-auto">
            <table class="table-auto w-full">
              <thead class="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                <tr>
                  <th class="p-2 whitespace-nowrap">
                    <div class="font-semibold text-left">Nom</div>
                  </th>
                  <th class="p-2 whitespace-nowrap">
                    <div class="font-semibold text-left">Marque</div>
                  </th>
                  <th class="p-2 whitespace-nowrap">
                    <div class="font-semibold text-left">Taille</div>
                  </th>
                  <th class="p-2 whitespace-nowrap">
                    <div class="font-semibold text-left"></div>
                  </th>
                </tr>
              </thead>
              <tbody class="text-sm divide-y divide-gray-100">
                <tr v-if="isAddingCard">
                  <td class="p-2 whitespace-nowrap">
                    <input v-model="newCard.name" type="text" class="mt-1 p-2 w-full border rounded-md" required>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <input v-model="newCard.marque" type="text" class="mt-1 p-2 w-full border rounded-md" required>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <input v-model="newCard.taille" type="text" class="mt-1 p-2 w-full border rounded-md" required>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <button @click="saveCard" class="bg-gray-500 p-2 border rounded  text-white hover:text-black hover:bg-white shadow">Ajouter</button>
                  </td>
                </tr>
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
  