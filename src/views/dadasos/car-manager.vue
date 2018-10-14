<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.company" v-if="roles.indexOf('admin')>=0" class="filter-item" placeholder="选择公司(散户不选，仅限超级管理员操作)" @focus="chooseCompany">
        <el-option v-for="(item,i) in companyOptions" :key="i" :label="item.companyName" :value="item.objectId"/>
      </el-select>
      <el-date-picker v-model="listQuery.time" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" class="filter-item" format="yyyy 年 MM 月 dd 日" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
      <!-- <el-input v-model="listQuery.mobile" placeholder="手机号查询" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/> -->
      <el-select v-model="listQuery.status" placeholder="车辆状态" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">添加车辆</el-button>
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
          <el-button type="primary" size="mini" v-if="scope.row.status !='2'" @click="handleReview(scope.row)">审核</el-button>
          <!-- <el-button size="mini" type="danger" v-if="roles.indexOf('admin') >=0" @click="handleModifyStatus(scope.row,'deleted')">{{ $t('table.delete') }}
          </el-button> -->
        </template>
      </el-table-column>
      <el-table-column label="编号" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.objectId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="车主姓名" min-width="200px" prop="realName" align="center">
      </el-table-column>
      <el-table-column label="车主电话" min-width="120px" prop="mobile" align="center">
      </el-table-column>
      <el-table-column label="身份证号" min-width="200px" prop="cardId" align="center">
      </el-table-column>
      <el-table-column label="车牌号" min-width="200px" prop="carNumber" align="center">
      </el-table-column>
      <el-table-column label="身份证正面" width="180px" align="center">
        <template slot-scope="scope">
          <img class="imgClass" :src="scope.row.cardFoward" alt="">
        </template>
      </el-table-column>
      <el-table-column label="身份证反面" width="180px" align="center">
        <template slot-scope="scope">
          <img class="imgClass" :src="scope.row.cardBack" alt="">
        </template>
      </el-table-column>
      <el-table-column label="行驶证" width="180px" align="center">
        <template slot-scope="scope">
          <img class="imgClass" :src="scope.row.xingshiCard" alt="">
        </template>
      </el-table-column>
      <el-table-column label="驾驶证" width="180px" align="center">
        <template slot-scope="scope">
          <img class="imgClass" :src="scope.row.drivieCard" alt="">
        </template>
      </el-table-column>
      <el-table-column label="所属公司" v-if="roles.indexOf('admin')>=0" width="180px" align="center">
        <template slot-scope="scope">
          <span>{{!!scope.row.company?scope.row.company.companyName:'无'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" width="180px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createdAt}}</span>
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

    <el-dialog :title="dialogStatus=='create'?'添加车主':'车主审核'" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="rowInfo" label-position="right" label-width="120px" style="width: 100%;" :rules="rules">
        <el-form-item label="选择公司" v-if="roles.indexOf('admin')>=0 && dialogStatus =='create'">
          <el-select v-model="company" class="filter-item" placeholder="选择公司(散户不选，仅限超级管理员操作)" @focus="chooseCompany">
            <el-option v-for="(item,i) in companyOptions" :key="i" :label="item.companyName" :value="item.objectId"/>
          </el-select>
        </el-form-item>
        <el-form-item label="车主姓名" prop="realName">
          <el-input v-model="rowInfo.realName" style="width:200px;"></el-input>
        </el-form-item>
        <el-form-item label="车主身份证号" prop="cardId">
          <el-input v-model="rowInfo.cardId" style="width:200px;"></el-input>
        </el-form-item>
        <el-form-item label="车主电话" prop="mobile">
          <el-input v-model="rowInfo.mobile" style="width:200px;"></el-input>
        </el-form-item>
        <el-form-item label="车牌号" prop="carNumber">
          <el-input v-model="rowInfo.carNumber" style="width:200px;"></el-input>
        </el-form-item>
        <el-form-item label="身份证正面" prop="cardFoward">
          <input v-if="dialogStatus=='create'" type="file" id="cardFoward" @change="uploadImg('cardFoward')">
          <img :src="rowInfo.cardFoward" style="width:100%" alt="">
        </el-form-item>
        <el-form-item label="身份证反面" prop="cardBack">
          <input v-if="dialogStatus=='create'" type="file" id="cardBack" @change="uploadImg('cardBack')">
          <img :src="rowInfo.cardBack" style="width:100%" alt="">
        </el-form-item>
        <el-form-item label="驾驶证照片" prop="drivieCard">
          <input v-if="dialogStatus=='create'" type="file" id="drivieCard" @change="uploadImg('drivieCard')">
          <img :src="rowInfo.drivieCard" style="width:100%" alt="">
        </el-form-item>
        <el-form-item label="行驶证照片" prop="xingshiCard">
          <input v-if="dialogStatus=='create'" type="file" id="xingshiCard" @change="uploadImg('xingshiCard')">
          <img :src="rowInfo.xingshiCard" style="width:100%" alt="">
        </el-form-item>
      </el-form>
      <span>添加车辆成功后，客户端登录用户名为车主手机号，密码默认 1111111</span>
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
import { parseTime, pickerOptions, isMobile, isIDCardNum } from '@/utils'
import { Bomb_Search, Bmob_Update, Bmob_UploadImg, Bomb_Add, getUserNewInfo, Bmob_CreatePoint, Bomb_Search2, register } from '@/utils/bmob.js'
import { mapGetters } from 'vuex'

const calendarTypeOptions = [
  { key: '', display_name: '全部' },
  { key: '-1', display_name: '审核未通过' },
  { key: '0', display_name: '待审核' },
  { key: '1', display_name: '审核中' },
  { key: '2', display_name: '审核通过' },
]

const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'car-manage',
  directives: {
    waves
  },
  filters: {
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    const validateCardId = (rule, value, callback) => {
      if (!isIDCardNum(value)) {
        callback(new Error('请输入正确的身份证号码'))
      } else {
        callback()
      }
    }
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
        realName:[
          { required: true, message: '请输入车主姓名',trigger: 'blur' }
        ],
        mobile:[
          { required: true, trigger: 'blur', validator: validateMobile }
        ],
        carNumber:[
          { required: true, message: '请输入车牌号码', trigger: 'blur'}
        ],
        cardId:[
          { required: true, trigger: 'blur', validator: validateCardId }
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
        status: val?'2':'-1'
      }
      Bmob_Update('validUser',this.rowInfo.objectId,data).then(res => {
        this.$message({ type: 'success', message: '审核成功'})
        this.dialogFormVisible = false
        this.getList()
        this.actionLoading = false
      }).catch(err => {
        this.$message.error("请求失败，稍后再试")
        this.actionLoading = false
      })
      Bmob_Update('_User',this.rowInfo.user.objectId,{ 'status':'1','nickName': this.rowInfo.realName }).then(()=> {

      })
    },
   async getList() {
      this.listLoading = true
      let data = {},objectId,isCompany
      //  获取当前用户信息，判断是否是企业用户
      await getUserNewInfo().then((res) => {
        objectId = res.objectId;
        isCompany = res.isCompany;
      })
      if(this.roles.indexOf('admin')>=0){
        if(!!this.listQuery.company && this.listQuery.company !=''){
          data.company = this.listQuery.company
        }
      }else if(!!isCompany && isCompany == '1'){
        let temp = Bmob_CreatePoint('_User',objectId)
        await Bomb_Search2('company',{ 'user': temp }).then(g => {
          g.length>0 && (data.company = Bmob_CreatePoint('company',g[0].objectId))
        })
      }
      if(!!this.listQuery.status && this.listQuery.status !=''){
        data.status = this.listQuery.status
      }
      Bomb_Search('validUser',data,this.listQuery.limit,this.listQuery.page,this.listQuery.time,{ key:'company', value:'company' }).then(res => {
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
          let objectId,isCompany,roles;
          await getUserNewInfo().then((res) => {
            objectId = res.objectId;
            isCompany = res.isCompany;
            roles = res.roles[0]
          })
          let u = Bmob_CreatePoint('_User',objectId)
          // this.rowInfo.user = u;
              //  该用户是企业用户
          if((!!isCompany && isCompany ==='1')){
            await Bomb_Search2('company',{'user':u}).then((c) => {
              if(c.length > 0){
                this.rowInfo.company = Bmob_CreatePoint('company',c[0].objectId)
              }
            })
          }else if(roles == 'admin'){
            //  根据下拉框选择公司
            if(!!this.company && this.company !=''){
              this.rowInfo.company = Bmob_CreatePoint('company',this.company)
            }
          }else{
            this.$message.error("您暂无权限操作")
            return
          }
          let d = {
            mobile:this.rowInfo.mobile,
            pwd: '1111111',
            status: '1',
            // carInfo: c,
            nickName:this.rowInfo.realName,
            carNumber: this.rowInfo.carNumber,
            company: this.rowInfo.company
          }
          await register(d).then((r) => {
            console.log('注册成功')
            let p = Bmob_CreatePoint('_User',r.objectId)
            this.rowInfo.user = p
            this.rowInfo.uInfo = Bmob_CreatePoint('userInfo',r.uObjectId)
            this.rowInfo.status = '2'
            Bomb_Add('validUser',this.rowInfo).then(async(data) => {
            //  更新user信息
              let c = Bmob_CreatePoint('validUser',data.objectId)
              Bmob_Update('_User',r.objectId,{'carInfo': c })
              this.dialogFormVisible = false
              this.actionLoading = false
              this.getList()
            })
          }).catch(err => {
            this.$message.error("注册失败，请检查手机号码是否重复")
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

