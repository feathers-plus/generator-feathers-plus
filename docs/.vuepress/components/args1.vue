<template>
  <div class="number-modifier">
    <button @click="increment()">+</button>
    <strong> {{value}} </strong>
    <button @click="decrement()">-</button>
  </div>
</template>

<script>
  export default {
    props: ['start'],

    // We have to copy the value because we can't use v-model with
    // nothing to bind to.
    // (VuePress doesn't have support for reactive page variables at the moment.)
    data() {
      return {
        value: this.start
      }
    },

    methods: {
      increment() { this.value++ },
      decrement() { this.value-- }
    }
  }
</script>