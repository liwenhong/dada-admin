<template>
  <div class="page">
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="curpage"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </div>
</template>
<script>
export default {
  name: 'pagination',
  props: {
    curpage: {
      type: Number,
      default: 1
    },
    pagesize: {
      type: Number,
      default: 10
    },
    total: {
      type: Number,
      default: 0
    }
  },
  // watch: {
  //   curpage: {
  //     handler(newValue, oldValue) {
  //       console.log(newValue,'...',oldValue)
  //     },
  //     deep: true
  //   },
  //   pagesize: {
  //     handler(newValue, oldValue) {
  //       console.log(newValue,'...',oldValue)
  //     },
  //     deep: true
  //   }
  // },
  methods: {
    handleSizeChange(val) {
      this.$emit('handleSizeChange', val)
    },
    handleCurrentChange(val) {
      this.$emit('handleCurrentChange', val)
    }
  }
}
</script>
<style lang="scss" scoped>
  .page{
    text-align: center;
    padding-top: 10px;
  }
</style>


