<template>
  <div class="collapsed">
    <button @click="toggle()">{{ vHidden ? 'Show' : 'Hide' }}</button><strong> {{ vTitle }}</strong>
    <div v-show="!vHidden"><slot></slot></div>
  </div>
</template>

<script>
  /* Blank lines are required both before and after the <collapse> and </collapse> tags.
   ...

   <collapse hidden title="...">

   ...

   </collapse>

   ...
   */
  export default {
    props: ['hidden', 'title'],

    data() {
      return {
        vHidden: this.hidden !== undefined,
        vTitle: this.title
      };
    },

    methods: {
      toggle() {
        this.vHidden = !this.vHidden;
      }
    }
  }
</script>