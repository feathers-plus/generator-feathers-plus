<template>
  <div class="optional-text">
    <button @click="show()">Show</button>{{ alt }}<button @click="hide()">Hide</button>
    <br/>
    <div class="danger custom-block" v-bind:style="{ display: display }">
      <p class="custom-block-title" >STOP</p>
      <p>Until the generator is released, all references in the documentation to <code>@feathers-plus</code>
      should be replaced with <code>@feathers-x</code>.</p>
    </div>
    <code>
      aaa
      bbb
      ccc
    </code>
    <br/>
  </div>
</template>

<script>
  // <img :src="$withBase('/foo.png')" alt="foo">
  export default {
    props: ['hidden', 'title'],

    data() {
      return {
        display: this.hidden ? 'none' : 'block',
        alt: this.title
      };
    },

    methods: {
      show() {
        this.display = 'block';
      },
      hide() {
        this.display = 'none';
      }
    }
  }
</script>