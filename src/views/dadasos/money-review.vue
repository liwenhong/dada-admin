<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.company" v-if="roles.indexOf('admin')>=0" class="filter-item" placeholder="选择公司(散户不选，仅限超级管理员操作)" @focus="chooseCompany">
        <el-option v-for="(item,i) in companyOptions" :key="i" :label="item.companyName" :value="item.objectId"/>
      </el-select>
      <el-date-picker v-model="listQuery.time" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" class="filter-item" format="yyyy 年 MM 月 dd 日" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
      <el-select v-model="listQuery.status" placeholder="流水状态" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>
      <el-input v-model="listQuery.mobile" placeholder="手机号查询" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <!-- <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">添加企业</el-button> -->
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">{{ $t('table.export') }}</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;">
      <el-table-column type="selection" fixed></el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" fixed width="120" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" v-if="roles.indexOf('admin')>=0 && scope.row.status =='0'" @click="handleReview(scope.row)">审核</el-button>
          <!-- <el-button size="mini" type="danger" v-if="roles.indexOf('admin') >=0" @click="handleModifyStatus(scope.row,'deleted')">{{ $t('table.delete') }}
          </el-button> -->
        </template>
      </el-table-column>
      <el-table-column label="编号" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.objectId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="车主姓名" min-width="200px" prop="username" align="center">
      </el-table-column>
      <el-table-column label="类型" min-width="120px" prop="type" align="center">
        <template slot-scope="scope">
          {{scope.row.type === 1? '入账':'提现'}}
        </template>
      </el-table-column>
      <el-table-column label="车主电话" min-width="200px" prop="mobile" align="center">
      </el-table-column>
      <el-table-column label="车牌号" min-width="200px" prop="carNumber" align="center">
      </el-table-column>
      <el-table-column label="金额" width="180px" align="center" prop="amount"></el-table-column>
      <el-table-column label="提交时间" width="180px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createdAt}}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="180px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.updatedAt}}</span>
        </template>
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

    <el-dialog
      title="提示"
      :visible.sync="dialogFormVisible"
      width="30%">
      <span>是否通过审核？</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="danger" @click="confirmPass(false)">不通过</el-button>
        <el-button type="primary" @click="confirmPass(true)">通 过</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import waves from '@/directive/waves' // 水波纹指令
import { parseTime, pickerOptions, isMobile } from '@/utils'
import { Bomb_Search, Bmob_Update, getUserNewInfo, Bmob_CreatePoint, Bomb_Search2, Bmob_QueryMoneyFlow } from '@/utils/bmob.js'
import { mapGetters } from 'vuex'

const calendarTypeOptions = [
  { key: '', display_name: '全部' },
  { key: '0', display_name: '待审核' },
  { key: '1', display_name: '审核通过' },
  { key: '-1', display_name: '审核不通过' }
]

const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'money-review',
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
      companyOptions:[],
      pickerOptions:pickerOptions,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        time: undefined,
        status: '0',
        company:''
      },
      calendarTypeOptions,
      dialogFormVisible: false,
      actionLoading: false,
      rowInfo: {},
      downloadLoading: false
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
    chooseCompany(e){
      Bomb_Search2('company',{}).then(res => {
        this.companyOptions = res
      })
    },
    handleReview(row){
      this.rowInfo = row
      this.dialogFormVisible = true
    },
    confirmPass(val){
      this.actionLoading = true
      let data ={
        status: val?'1':'-1'
      }
      Bmob_Update('bankAccount',this.rowInfo.objectId,data).then(res => {
        this.$message({ type: 'success', message: '审核成功'})
        this.dialogFormVisible = false
        this.getList()
        this.actionLoading = false
      }).catch(err => {
        this.$message.error("请求失败，稍后再试")
        this.actionLoading = false
      })
    },
    getList() {
      //  判断是企业用户还是管理员，获取当前用户最新的用户信息
      //  如果是企业用户，则查询该企业下所有车辆的流水，如果是管理员账户则显示所有流水，默认显示待审核的
      this.listLoading = true
      let data = {
        company: ''
      }
      if(this.roles.indexOf('admin')>=0){
        //  管理员
        if(!!this.listQuery.company && this.listQuery.company !=''){
          data.company = Bmob_CreatePoint('company',this.listQuery.company)
        }
        this.getInfo(data.company)
      }else{
        getUserNewInfo().then(res => {
          let u = Bmob_CreatePoint('_User',res.objectId)
          Bomb_Search2('company',{'user':u}).then(data => {
            if(!!data && data.length>0){
              data.company = Bmob_CreatePoint('company',data[0].objectId)
              this.getInfo(data.company)
            }else{
              this.$message({ type: 'warning', message: '暂未找到企业，请联系管理员'})
              return
            }
          })
        })
      }
    },
    getInfo(data){
      console.log(data)
      let d ={}
      if(data !=''){
        d.company = data
      }else{
        d ={}
      }
      if(!!this.listQuery.status && this.listQuery.status !=''){
        d.status = this.listQuery.status
      }
      if(!!this.listQuery.mobile && this.listQuery.mobile !=''){
        d.mobile = this.listQuery.mobile
      }
      Bomb_Search('bankAccount',d,this.listQuery.limit,this.listQuery.page,this.listQuery.time,{ key:'company', value:'company' }).then(res => {
        this.total = res.count
        this.list = res.data
        this.listLoading = false
      }).catch(err => {
        this.$message.error("查询失败，请稍后再试")
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
    async handleDownload() {
      this.$message({ type:'warning', message: '该功能暂未实现，敬请期待'})
      return
      this.downloadLoading = true
      // await Bomb_Search('bankAccount',{},)
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['编号', '车主姓名', '类型', '车主电话', '车牌号','金额','提交时间','更新时间','状态']
        const filterVal = ['objectId', 'username', 'type', 'mobile', 'carNumber','amount','createdAt','updatedAt','status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '流水记录'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'type') {
          return v[j] == 1?'入账':'提现'
        }else if(j === 'status'){
          return v[j] == 0?'待审核':(v[j]==1?'审核通过':'审核未通过')
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
<style lang="scss" scoped>
.imgClass{
  width: 100%;
}
</style>

