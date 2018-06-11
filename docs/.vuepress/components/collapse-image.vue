<template>
  <div class="collapsed-image">
    <button @click="toggle()">{{ vHidden ? 'Show image' : 'Hide image' }}</button><strong> {{ vTitle }}</strong>
    <br/>
    <p><img :src="$withBase(vUrl)" v-show="!vHidden" alt="vTitle"></p>
    <br/>
  </div>
</template>

<script>
  export default {
    props: ['hidden', 'title', 'url'],

    data() {
      return {
        vHidden: this.hidden !== undefined,
        vTitle: this.title,
        vUrl: this.url
      };
    },

    methods: {
      toggle() {
        this.vHidden = !this.vHidden;
      }
    }
  }
</script>