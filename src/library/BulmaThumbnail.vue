<template>
  <figure class="image is-square">
    <img :src="imageUrl" :alt="altText" />
  </figure>
</template>

<style>
/* Crop images instead of stretching them. From: 
 * https://github.com/jgthms/bulma/issues/2023#issuecomment-414129646 */
img {
  height: 100%;
  object-fit: cover;
}
</style>

<script>
export default {
  props: {
    imageUrl: {
      type: String,
      default: 'https://www.tibs.org.tw/images/default.jpg',
    },
    altText: {
      type: String,
      default: 'Placeholder image',
    },
  },
}
</script>
