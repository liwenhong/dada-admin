<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker v-model="listQuery.time" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" class="filter-item" format="yyyy 年 MM 月 dd 日" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
      <!-- <el-input v-model="listQuery.mobile" placeholder="手机号查询" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/> -->
      <el-select v-model="listQuery.status" placeholder="企业状态" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">添加企业</el-button>
      <!-- <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">{{ $t('table.export') }}</el-button> -->
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
          <el-button type="primary" size="mini" v-if="scope.row.status !='1'" @click="handleReview(scope.row)">审核</el-button>
          <!-- <el-button size="mini" type="danger" v-if="roles.indexOf('admin') >=0" @click="handleModifyStatus(scope.row,'deleted')">{{ $t('table.delete') }}
          </el-button> -->
        </template>
      </el-table-column>
      <el-table-column label="编号" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.objectId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="企业名称" min-width="200px" prop="companyName" align="center">
      </el-table-column>
      <el-table-column label="企业法人(负责人)" min-width="120px" prop="companyCEO" align="center">
      </el-table-column>
      <el-table-column label="法人电话" min-width="200px" prop="chargeMobile" align="center">
      </el-table-column>
      <el-table-column label="企业地址" min-width="200px" prop="companyAddress" align="center">
      </el-table-column>
      <el-table-column label="企业营业执照" width="180px" align="center">
        <template slot-scope="scope">
          <img class="imgClass" :src="scope.row.companyCard" alt="">
        </template>
      </el-table-column>
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

    <el-dialog :title="dialogStatus=='create'?'添加企业':'企业审核'" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="rowInfo" label-position="right" label-width="120px" style="width: 100%;" :rules="rules">
        <el-form-item label="企业名称" prop="companyName">
          <el-input v-model="rowInfo.companyName" style="width:200px;"></el-input>
        </el-form-item>
        <el-form-item label="企业法人(负责人)" prop="companyCEO">
          <el-input v-model="rowInfo.companyCEO" style="width:200px;"></el-input>
        </el-form-item>
        <el-form-item label="法人电话" prop="chargeMobile">
          <el-input v-model="rowInfo.chargeMobile" style="width:200px;"></el-input>
        </el-form-item>
        <el-form-item label="企业地址" prop="companyAddress">
          <el-input v-model="rowInfo.companyAddress" style="width:200px;"></el-input>
        </el-form-item>
        <el-form-item label="企业营业执照" prop="companyCard">
          <input v-if="dialogStatus=='create'" type="file" id="companyCard" @change="uploadImg('companyCard')">
          <img :src="rowInfo.companyCard" style="width:100%" alt="">
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="dialogStatus != 'create'">
        <!-- <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button> -->
        <el-button type="danger" @click="confirmPass(false)" :loading="actionLoading">不通过</el-button>
        <el-button type="primary" @click="confirmPass(true)" :loading="actionLoading">通过</el-button>
      </div>
      <div slot="footer" class="dialog-footer" v-else>
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="createData('dataForm')" :loading="actionLoading">添加</el-button>
      </div>

    </el-dialog>

  </div>
</template>

<script>
import waves from '@/directive/waves' // 水波纹指令
import { parseTime, pickerOptions, isMobile } from '@/utils'
import { Bomb_Search, Bmob_Update, Bmob_UploadImg, Bomb_Add, getUserNewInfo, Bmob_CreatePoint, Bomb_Search2, register, Bmob_updateAll } from '@/utils/bmob.js'
import { mapGetters } from 'vuex'

const calendarTypeOptions = [
  { key: '', display_name: '全部' },
  { key: '-1', display_name: '认证失败' },
  { key: '0', display_name: '未认证' },
  { key: '1', display_name: '认证通过' }
]

const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'company-review',
  directives: {
    waves
  },
  filters: {
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    const validateMobile = (rule, value, callback) => {
      if (!isMobile(value)) {
        callback(new Error('请输入正确的手机号码'))
      } else {
        callback()
      }
    }
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
        status: ''
      },
      calendarTypeOptions,
      dialogFormVisible: false,
      actionLoading: false,
      rowInfo: {},
      company:'',
      dialogStatus: '',
      rules:{
        companyCEO:[
          { required: true, message: '请输入法人姓名',trigger: 'blur' }
        ],
        chargeMobile:[
          { required: true, trigger: 'blur', validator: validateMobile }
        ],
        companyName:[
          { required: true, message: '请输入企业名称', trigger: 'blur'}
        ],
        companyAddress:[
          { required: true, message: '请输入企业地址', trigger: 'blur' }
        ]
      }
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
      console.log(e)
      Bomb_Search2('company',{}).then(res => {
        this.companyOptions = res
      })
    },
    uploadImg(id){
      const fileUploadControl = document.getElementById(id);
      if(fileUploadControl && fileUploadControl.files.length>0){
        Bmob_UploadImg(fileUploadControl.files[0].name,fileUploadControl.files[0]).then(res => {
          this.$set(this.rowInfo,id,res[0].url)
          this.rowInfo[id] = res[0].url
        }).catch(err => {
          this.$message.error("上传失败，请稍后再试")
        })
      }
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
      Bmob_Update('company',this.rowInfo.objectId,data).then(res => {
        this.$message({ type: 'success', message: '审核成功'})
        this.dialogFormVisible = false
        this.getList()
        this.actionLoading = false
        //  更改_User表isCompany的值
        Bmob_Update('_User',this.rowInfo.user.objectId,{'isCompany':'1','roles':['company']}).then(()=> {
          console.log('状态更改成功')
        })
        //  判断该用户有没有车辆，有则更改车辆信息
        let u = Bmob_CreatePoint('_User',this.rowInfo.user.objectId)
        let c = Bmob_CreatePoint('company',this.rowInfo.objectId)
        Bomb_Search2('validUser',{'user':u}).then(r =>{
          if(r.length>0){
            //  批量修改
            Bmob_updateAll('validUser',{'user':u},{'company':c}).then(l => {
              console.log(l)
            }).catch(err => {
              this.$message.error("状态修改失败")
            })
          }
        })
      }).catch(err => {
        this.$message.error("请求失败，稍后再试")
        this.actionLoading = false
      })
    },
    getList() {
      console.log(this.listQuery)
      this.listLoading = true
      let data = {}
      if(!!this.listQuery.status && this.listQuery.status !=''){
        data.status = this.listQuery.status
      }
      Bomb_Search('company',data,this.listQuery.limit,this.listQuery.page,this.listQuery.time).then(res => {
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
      this.$refs['dataForm'].validate(async (valid) => {
        if (valid) {
          this.actionLoading = true
          let d = {
            mobile:this.rowInfo.chargeMobile,
            pwd: '1111111',
            status: '1',
            nickName:this.rowInfo.companyCEO
          }
          await register(d).then((r) => {
            console.log('注册成功')
            let p = Bmob_CreatePoint('_User',r.objectId)
            this.rowInfo.user = p
            this.rowInfo.status = '1'
            Bomb_Add('company',this.rowInfo).then(async(data) => {
            //  更新user信息
              Bmob_Update('_User',r.objectId,{ 'isCompany': '1', 'roles':['company'] })
              this.dialogFormVisible = false
              this.actionLoading = false
              this.getList()
            })
          }).catch(err => {
            console.log(err)
            this.$message.error("添加失败")
            this.actionLoading = false
          })
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
<style lang="scss" scoped>
.imgClass{
  width: 100%;
}
</style>

