import { ref, type Ref } from 'vue';

export const isConnected: Ref<boolean> = ref(false);

export function setConnected(value: boolean): void {
  isConnected.value = value;
}

export function checkConnected(): void {
  isConnected.value = !!localStorage.getItem('authToken');
}
