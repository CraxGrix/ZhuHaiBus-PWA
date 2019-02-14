<template>
  <v-toolbar>
    <v-toolbar-side-icon>
      <slot name="side-icon"></slot>
    </v-toolbar-side-icon>
    <slot></slot>
    <v-spacer></v-spacer>
    <slot name="action"></slot>
  </v-toolbar>
</template>
<script>
  export default {
    data: () => ({
    })
  }
</script>