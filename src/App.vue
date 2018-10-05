<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { Bmob_Init } from '@/utils/bmob.js'
export default{
  name: 'App',
  created(){
    console.log('.......')
    Bmob_Init()
  }
}
</script>
