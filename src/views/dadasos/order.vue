<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker v-model="listQuery.time" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" class="filter-item" format="yyyy 年 MM 月 dd 日" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
      <!-- <el-input v-model="listQuery.mobile" placeholder="手机号查询" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/> -->
      <el-select v-model="listQuery.status" placeholder="订单状态" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('table.add') }}</el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">{{ $t('table.export') }}</el-button>
    </div>
    <!-- :key="tableKey" -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;">
      <el-table-column type="selection" fixed></el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" fixed width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row,'update')">{{ $t('table.edit') }}</el-button>
          <el-button size="mini" type="danger" v-if="roles.indexOf('admin') >=0" @click="handleModifyStatus(scope.row,'deleted')">{{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="订单id" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单编号" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.objectId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单时间" width="180px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createdAt}}</span>
        </template>
      </el-table-column>
      <el-table-column label="起点" min-width="200px" prop="addressFromDetail" align="center">
        <!-- <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.title }}</span>
          <el-tag>{{ scope.row.type | typeFilter }}</el-tag>
        </template> -->
      </el-table-column>
      <el-table-column label="终点" min-width="200px" prop="addressToDetail" align="center">
      </el-table-column>
      <el-table-column label="救援师傅" min-width="120px" prop="" align="center">
        <template slot-scope="scope">
          <span>{{ !!scope.row.carUser?scope.row.carUser.nickname:'' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单金额" width="110px" align="center" prop="amount" >
      </el-table-column>
      <el-table-column label="状态" width="110px" align="center" prop="status">
        <template slot-scope="scope">
          <span>{{ scope.row.status | typeFilter }}</span>
        </template>
      </el-table-column>

    </el-table>

    <div class="pagination-container">
      <el-pagination v-show="total>0" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>

    <el-dialog :title="dialogStatus=='create'?'添加订单':'修改订单'" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="rowInfo" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">

        <!-- <el-form-item :label="$t('table.date')" prop="timestamp">
          <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="Please pick a date"/>
        </el-form-item> -->
        <el-form-item label="起点" prop="title">
          <el-autocomplete
            v-model="rowInfo.addressFromDetail"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入起点" :trigger-on-focus="false"
            @select="handleSelect" style="width:80%"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="终点" prop="title">
          <el-autocomplete
            v-model="rowInfo.addressToDetail"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入终点" :trigger-on-focus="false"
            @select="handleSelect" style="width:80%"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="救援师傅">
          <!-- <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item"/>
          </el-select> -->
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input :disabled="(dialogStatus=='update' && roles.indexOf('admin') ==-1)" v-model="rowInfo.amount" style="width:200px;"></el-input>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="rowInfo.status" placeholder="订单状态" clearable>
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
          </el-select>
        </el-form-item>
      </el-form>
      <span v-if="dialogStatus=='update'">* 请谨慎操作订单。<br/>未经用户允许，请勿随意更改订单，如被用户投诉，平台将扣除相应的佣金以及减少企业的信用值。</span>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>

    <!-- <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel"/>
        <el-table-column prop="pv" label="Pv"/>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog> -->

  </div>
</template>

<script>
import waves from '@/directive/waves' // 水波纹指令
import { parseTime, pickerOptions } from '@/utils'
import { Bomb_Search } from '@/utils/bmob.js'
import { mapGetters } from 'vuex'

const calendarTypeOptions = [
  { key: '', display_name: '全部' },
  { key: '-1', display_name: '订单取消' },
  { key: '0', display_name: '未接单' },
  { key: '1', display_name: '师傅已接单' },
  { key: '2', display_name: '救援中' },
  { key: '3', display_name: '等待用户支付' },
  { key: '4', display_name: '救援完成' }
]

const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'Order',
  directives: {
    waves
  },
  filters: {
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      pickerOptions:pickerOptions,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        time: undefined,
        status: ''
      },
      calendarTypeOptions,
      dialogFormVisible: false,
      downloadLoading: false,
      rowInfo: {},
      dialogStatus: '',
    }
  },
  created() {
    this.getList()
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  methods: {
    handleSelect(e){
      console.log(e)
    },
    querySearchAsync(queryString, cb) {
      // var restaurants = this.restaurants;
      // var results = queryString ? restaurants.filter(this.createStateFilter(queryString)) : restaurants;

      // clearTimeout(this.timeout);
      // this.timeout = setTimeout(() => {
      //   cb(results);
      // }, 3000 * Math.random());
    },
    getList() {
      console.log(this.listQuery)
      this.listLoading = true
      let data = {}
      if(!!this.listQuery.status && this.listQuery.status !=''){
        data.status = this.listQuery.status
      }
      Bomb_Search('Order',data,this.listQuery.limit,this.listQuery.page,this.listQuery.time).then(res => {
        console.log(res)
        this.listLoading = false
        this.total = res.count
        this.list = res.data
      }).catch(err => {
        console.log(err)
        this.$message.error("请求失败,请稍后再试")
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    resetTemp() {
      this.rowInfo = {}
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          // this.temp.author = 'vue-element-admin'
          // createArticle(this.temp).then(() => {
          //   this.list.unshift(this.temp)
          //   this.dialogFormVisible = false
          //   this.$notify({
          //     title: '成功',
          //     message: '创建成功',
          //     type: 'success',
          //     duration: 2000
          //   })
          // })
        }
      })
    },
    handleUpdate(row) {
      this.rowInfo = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>

<style>
.pagination-container{
  text-align: center;
}
.el-date-editor .el-range-separator{
  padding: 0;
}
</style>
