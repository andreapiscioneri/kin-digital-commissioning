<script setup lang="ts">
withDefaults(defineProps<{ icon?: string; size?: number }>(), { icon: 'bulb', size: 20 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle v-if="icon === 'sun'" cx="10" cy="10" r="4" stroke="currentColor" stroke-width="1.3" />
    <path v-if="icon === 'sun'" d="M10 1v2M10 17v2M1 10h2M17 10h2M4 4l1.5 1.5M14.5 14.5L16 16M16 4l-1.5 1.5M5.5 14.5L4 16" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
    <path v-else-if="icon === 'moon'" d="M15 12.5A6.5 6.5 0 017.5 5a6.5 6.5 0 108 8.5" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
    <path v-else-if="icon === 'star'" d="M10 2l2.2 5 5.3.5-4 3.6 1.2 5.2L10 13.5 5.3 16.3l1.2-5.2-4-3.6 5.3-.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
    <path v-else-if="icon === 'home'" d="M3 9.5L10 3l7 6.5M5 8v9h10V8" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
    <path v-else-if="icon === 'glass'" d="M6 2h8l-1 8a3 3 0 01-6 0z M10 10v8M7 18h6" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
    <path v-else-if="icon === 'fast-forward'" d="M2 5l7 5-7 5zM11 5l7 5-7 5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
    <path v-else-if="icon === 'umbrella'" d="M2 10a8 8 0 0116 0H2zM10 2v1M10 10v7a2 2 0 01-4 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
    <path v-else-if="icon === 'coffee'" d="M3 8h11v4a4 4 0 01-4 4H7a4 4 0 01-4-4zM14 9h1.5a2 2 0 010 4H14" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
    <path v-else-if="icon === 'music'" d="M8 15a2 2 0 11-2-2 2 2 0 012 2zM8 15V4l9-1v10M15 13a2 2 0 11-2-2 2 2 0 012 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
    <path v-else-if="icon === 'heart'" d="M10 17S3 12.5 3 7.5a3.9 3.9 0 017-2.4A3.9 3.9 0 0117 7.5C17 12.5 10 17 10 17z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
    <path v-else-if="icon === 'lock'" d="M5 9V6a5 5 0 0110 0v3M4 9h12v9H4z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
    <template v-else-if="icon === 'bulb-off'">
      <circle cx="10" cy="8" r="5" stroke="currentColor" stroke-width="1.3" />
      <path d="M8 15h4M8.5 17h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
      <path d="M3 3l14 14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
    </template>
    <template v-else-if="icon === 'grid'">
      <rect x="2" y="2" width="7" height="7" stroke="currentColor" stroke-width="1.3" />
      <rect x="11" y="2" width="7" height="7" stroke="currentColor" stroke-width="1.3" />
      <rect x="2" y="11" width="7" height="7" stroke="currentColor" stroke-width="1.3" />
      <rect x="11" y="11" width="7" height="7" stroke="currentColor" stroke-width="1.3" />
    </template>
    <path v-else-if="icon === 'cloud'" d="M5.5 15a3.5 3.5 0 01-.5-6.96A4.5 4.5 0 0113.9 6.2 3.5 3.5 0 0114 13H5.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
    <template v-else>
      <circle cx="10" cy="8" r="5" stroke="currentColor" stroke-width="1.3" />
      <path d="M8 15h4M8.5 17h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
    </template>
  </svg>
</template>
