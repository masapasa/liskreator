<script setup lang="ts">
const route = useRoute();

const otherView = computed(() => {
  if (route.name == "index") {
    return { route: "/admin", name: "Manage" }
  }
  else {
    return { route: "/", name: "Subscribe" }
  }
})
</script>

<template>
  <div class="relative">
    <NuxtLink class="absolute top-5 left-5 z-20" :to="otherView.route" prefetch>
      {{ otherView.name }}
    </NuxtLink>
    <Toast />
    <NuxtPage />
  </div>
</template>

<style lang="postcss">
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700;800;900&display=swap');

body {
  background-color: var(--surface-ground);
}

body,
h1,
p,
button,
span {
  font-family: 'Outfit', sans-serif;
}
</style>