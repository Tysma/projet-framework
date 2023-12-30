<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Card {
  name: string;
  marque: string;
  taille: string;
  editing: boolean;
}


const cards = ref<Card[]>([]);

// ajout du filtre
const searchTerm = ref<string>('');

// READ

async function loadCards() {
  const response = await fetch('/api/shoes');
  const responseCards: Card[] = await response.json();
  cards.value = responseCards.map((card) => ({ ...card, editing: false }));
}

let id_user = localStorage.getItem('id_user');

// ADD
const loginMessage = ref('');
const isAddingCard = ref(false);
const newCard = ref<Card>({
  name: '',
  marque: '',
  taille: '',
  editing: false,
});

const addCard = () => {
  isAddingCard.value = true;
};

const saveCard = async () => {
  try {
    const response = await fetch('/api/ajout/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCard.value),
    });

    if (response.ok) {
      console.log('Carte ajoutée avec succès');
      loginMessage.value = 'Carte ajoutée avec succès';
      newCard.value = { name: '', marque: '', taille: '', editing: false };
      isAddingCard.value = false;
      loadCards();
    } else {
      console.log("Échec de l'ajout de la carte");
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la carte :', error);
  }
};

// UPDATE

async function updateCard(card: Card) {
  try {
    const response = await fetch('/api/shoes/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(card),
    });

    if (response.ok) {
      console.log('Inventaire modifié');
      loginMessage.value = 'Chaussure modifiée avec succès';
      card.editing = false;
    } else {
      console.error('Échec de la modification du Inventaire');
    }
  } catch (error) {
    console.error('Une erreur est survenue', error);
  }
}

// Delete
async function deleteCard(card: Card) {
  try {
    const response = await fetch('/api/shoes/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: card.name }),
    });

    if (response.ok) {
      console.log('Inventaire supprimé');
      loginMessage.value = 'Chaussure supprimée avec succès';
      const index = cards.value.findIndex((c) => c.name === card.name);
      cards.value.splice(index, 1);
    } else {
      console.error('Échec de la suppression');
    }
  } catch (error) {
    console.error('Une erreur est survenue', error);
  }
}

onMounted(() => {
  loadCards();
});

// Fonction de filtrage des cartes en fonction du terme de recherche
function filterCards(card: Card): boolean {
  return card.name.toLowerCase().includes(searchTerm.value.toLowerCase());
}
</script>

<template>
  <section class="antialiased bg-gray-100 text-gray-600 h-screen px-4">
    <div class="flex flex-col justify-center h-full">
      <div class="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-sm border border-gray-200">
        <header class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="font-semibold text-gray-800 text-2xl">MyStock</h2>
          <p class="text-center text-sm font-light text-green-500 dark:text-green-500">{{ loginMessage }}</p>
          <button @click="addCard" class="text-right bg-gray-500 px-4 py-2 border rounded  text-white hover:text-black hover:bg-white shadow">Ajouter</button>
        </header>

        <div class="p-3">
          <div class="overflow-x-auto">
            <!-- FILTRE -->
            <input v-model="searchTerm" type="text" class="mt-2 p-2 w-full border rounded-md" placeholder="Rechercher par nom de chaussure">
            
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
                    <div class="font-semibold text-left">Actions</div>
                  </th>
                </tr>
              </thead>

              <!-- Add -->
              <tbody class="text-sm divide-y divide-gray-100">
                <tr v-if="isAddingCard">
                  <td class="p-2 whitespace-nowrap">
                    <input v-model="newCard.name" type="text" class="mt-1 p-2 w-full border rounded-md" required>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <input v-model="newCard.marque" type="text" class="mt-1 p-2 w-full border rounded-md" required>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <input v-model="newCard.taille" type="number" class="mt-1 p-2 w-full border rounded-md" required>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <button @click="saveCard" class="bg-gray-500 p-2 border rounded  text-white hover:text-black hover:bg-white shadow">Ajouter</button>
                    
                  </td>
                </tr>

                <!-- FILTRE -->
                <tr v-for="card in cards.filter(filterCards)" :key="card.name">

                  <!-- Update et Read et Delete-->
                  <td class="p-2 whitespace-nowrap">
                    {{ card.name }}
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <template v-if="!card.editing">{{ card.marque }}</template>
                    <input v-else v-model="card.marque" type="text" class="mt-1 p-2 w-full border rounded-md" required>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <template v-if="!card.editing">{{ card.taille }}</template>
                    <input v-else v-model="card.taille" type="number" max="2" class="mt-1 p-2 w-full border rounded-md" required>
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <template v-if="!card.editing">
                      <button @click="card.editing = true" class="bg-blue-500 p-2 border rounded text-white hover:text-black hover:bg-white shadow">Modifier</button>
                      <button @click="deleteCard(card)" class="bg-red-500 p-2 border rounded text-white hover:text-black hover:bg-white shadow ml-5">Supprimer</button>
                    </template>
                    <template v-else>
                      <button @click="() => updateCard(card)" class="bg-green-500 p-2 border rounded text-white hover:text-black hover:bg-white shadow">Enregistrer</button>
                      <button @click="() => (card.editing = false)" class="bg-gray-500 p-2 border rounded text-white hover:text-black hover:bg-white shadow ml-5">Annuler</button>
                    </template>
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
