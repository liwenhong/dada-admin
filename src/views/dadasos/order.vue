<template>
  <div class="app-container">
    <div id="map"></div>
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
      <el-table-column label="救援师傅" min-width="120px" prop="" align="center" >
        <template slot-scope="scope">
          <span>{{ !!scope.row.carUser?scope.row.carUser.nickName:'无' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="车牌号" min-width="200px" prop="" align="center">
        <template slot-scope="scope">
          <span>{{ !!scope.row.carUser?scope.row.carUser.carNumber:'无' }}</span>
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
      <el-form ref="dataForm" :model="rowInfo" :rules="rules" label-position="right" label-width="100px" style="width: 80%;">
        <el-form-item label="订单类型" prop="timestamp">
          <el-select v-model="order.type" placeholder="请选择订单类型" style="width:120px;" :disabled="dialogStatus!='create'">
            <el-option
              v-for="item in cityOptions"
              :key="item.key"
              :label="item.value"
              :value="item.key" >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="起点" prop="addressFromDetail">
          <div style="display:flex;">
            <el-autocomplete
              popper-class="my-autocomplete"
              v-model="rowInfo.addressFromDetail"
              :fetch-suggestions="querySearchAsync"
              placeholder="请输入起点" :trigger-on-focus="false"
              @select="handleSelect($event,'addressFromDetail')" style="width:80%" :disabled="dialogStatus!='create'">
            <template slot-scope="{ item }">
              <div class="name">{{ item.title }}</div>
              <span class="addr">{{ item.address }}</span>
            </template>
            </el-autocomplete>
          </div>
        </el-form-item>
        <el-form-item label="终点" prop="addressToDetail">
          <div style="display:flex;">
            <el-autocomplete
              popper-class="my-autocomplete"
              v-model="rowInfo.addressToDetail"
              :fetch-suggestions="querySearchAsync"
              placeholder="请输入终点" :trigger-on-focus="false"
              @select="handleSelect($event,'addressToDetail')" style="width:80%" :disabled="dialogStatus!='create'">
            <template slot-scope="{ item }">
              <div class="name">{{ item.title }}</div>
              <span class="addr">{{ item.address }}</span>
            </template>
            </el-autocomplete>
          </div>

        </el-form-item>
        <el-form-item :label="dialogStatus=='create'?'指派师傅':'救援师傅'">
          <span v-if="dialogStatus!='create'">{{!!rowInfo.carUser?rowInfo.carUser.nickName:'无'}}</span>
          <el-select v-else v-model="rowInfo.carUser" placeholder="选择救援师傅" @focus="chooseCar" @change="changeCar()">
            <el-option v-for="(item,i) in carOptions" :key="i" :label="item.realName+'--'+item.carNumber" :value="item.uInfo.objectId" :disabled="!!item.uInfo &&  !!item.uInfo.status && item.uInfo.status!=0"/>
          </el-select>
        </el-form-item>
        <el-form-item label="订单金额(元)">
          <el-input v-if="dialogStatus!='create'" :disabled="(dialogStatus=='update' && roles.indexOf('admin') ==-1)" v-model="rowInfo.amount" style="width:200px;"></el-input>
          <el-input v-else v-model="order.amount" style="width:200px;"></el-input>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="rowInfo.status" placeholder="订单状态" clearable>
            <el-option :disabled="item.key =='4'" v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
          </el-select>
        </el-form-item>
      </el-form>
      <span v-if="dialogStatus=='update'">* 请谨慎操作订单。<br/>未经用户允许，请勿随意更改订单，如被用户投诉，平台将扣除相应的佣金以及减少企业的信用值。</span>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" :loading="downloadLoading" type="primary" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-else type="primary" @click="updateData" :loading="downloadLoading">{{ $t('table.confirm') }}</el-button>
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
import { Bomb_Search, getUserNewInfo, Bmob_CreatePoint, Bmob_CreateLocation, Bomb_Add, Bmob_Update, del, sendSmsCode, Bomb_Search2, Bmob_QueryLocation } from '@/utils/bmob.js'
import { searchPlace, transferLocation, getDistanceByPoint } from '@/utils/baidu-map.js'
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
      city:'长沙市',
      cityOptions: [{key:'1',value:'道路救援'},{key:'2',value:'长途运输'}],
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
      carOptions: [],
      order: {
        user: null,
        addressFromDetail: '',
        addressTo: '',
        addressToDetail: '',
        amount: '',
        carUser: null,
        fromLat: '',
        fromLng: '',
        status: '0',
        toLat: '',
        toLng: '',
        addressFrom: '',
        type: '1'
      },
      price:{ '1': 7, '2': 8 },
      rules:{
        addressToDetail:[
          { required: true, message: '请选择终点',trigger: 'blur' }
        ],
        addressFromDetail:[
          { required: true,message: '请选择起点', trigger: 'blur' }
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
    changeCar(){
      console.log(this.rowInfo.carUser)
      if(this.rowInfo.carUser){
        this.order.carUser = Bmob_CreatePoint('userInfo',this.rowInfo.carUser)
        this.rowInfo.status = '1'
      }
    },
    async chooseCar(e){
      console.log(e)
      //  选择救援师傅，判断用户是否是企业用户
      let objectId,isCompany
      await getUserNewInfo().then((res) => {
        objectId = res.objectId;
        isCompany = res.isCompany;
      })
      if(!!isCompany && isCompany == '1'){
        let temp = Bmob_CreatePoint('_User',objectId)
        await Bomb_Search2('company',{ 'user': temp }).then(g => {
          Bomb_Search('validUser',{'company':Bmob_CreatePoint('company',g[0].objectId),'status':'2'},200,1,null,{key:'uInfo',value:'userInfo'}).then(tt => {
            console.log(tt)
            this.carOptions = tt.data
          })
        })
      }else{
        //  超级用户
        Bomb_Search('validUser',{'status':'2'},200,1,null,{key:'uInfo',value:'userInfo'}).then(tt => {
          console.log(tt)
          this.carOptions = tt.data
        })
      }
    },
    async handleSelect(e,el){
      console.log(e.point)
      this.$set(this.rowInfo,el,e.title)
      await transferLocation(e.point.lat,e.point.lng).then(res => {
        console.log(res)
        if(el=='addressToDetail'){
          this.order.addressTo = e.title
          this.order.addressToDetail = e.address
          this.order.toLng = res[0]
          this.order.toLat = res[1]
        }else{
          this.order.addressFrom = e.title
          this.order.addressFromDetail = e.address
          this.order.fromLng = res[0]
          this.order.fromLat = res[1]
        }
      })
      if(!!this.rowInfo.addressFromDetail && this.rowInfo.addressToDetail){
        //  计算订单金额
        getDistanceByPoint(this.order.fromLat,this.order.fromLng,this.order.toLat,this.order.toLng,'map').then(dd => {
          console.log(dd)
          let gl = (Math.ceil(dd.distance.replace('公里','')) -10)
          this.order.amount = gl<=0?200: gl*this.price[this.order.type]+200
        })
      }
      console.log(this.order)

    },
    querySearchAsync(queryString, cb) {
      if(!!queryString && queryString !=''){
        searchPlace(queryString).then(res => {
          cb(res)
        })
      }
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
      //  删除
      this.$confirm('确定要删除该订单吗, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        del('Order',row.objectId).then(res => {
          this.$message({ type: 'success', message: '删除成功'})
          this.getList()
        }).catch(e => {
          this.$message.error("删除失败")
        })
      }).catch(() => {

      });
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
      this.order.amount = '';
      this.order.carUser = ''
      this.order.status = ''
    },
    createData() {
      this.$refs['dataForm'].validate(async (valid) => {
        if (valid) {
          console.log(this.order)
          if(this.order.amount == '' || this.order.amount == 0){
            this.$message({ type: 'warning', message: '订单金额不能为空' })
            return
          }
          this.downloadLoading = true
          //  创建订单
          let f_point = Bmob_CreateLocation(this.order.fromLat,this.order.fromLng),u_objectId
          await getUserNewInfo().then(oo => {
            u_objectId = oo.objectId
          })
          let u = Bmob_CreatePoint("_User",u_objectId),o = this.order
          let data = {
            addressFrom: o.addressFrom,
            addressFromDetail: o.addressFromDetail,
            addressTo: o.addressTo,
            addressToDetail: o.addressToDetail,
            locationFrom: f_point,
            status: !!this.rowInfo.status?this.rowInfo.status:'0',
            toLat: o.toLat,
            toLng: o.toLng,
            amount: parseInt(o.amount),
            user: u,
            type: o.type
          }
          if(!!this.order.carUser && this.order.carUser != ''){
            data.carUser = this.order.carUser
            //  更改救援师傅状态
            Bmob_Update('userInfo',data.carUser.objectId,{'status':'1'}).then(()=> {})
          }
          Bomb_Add('Order',data).then(rr =>{
            this.$message({ type: 'success', message: '订单创建成功' })
            this.dialogFormVisible = false
            this.downloadLoading = false
            this.getList()
            this.toNotice(this.order.fromLat,this.order.fromLng)
            //  如果没有指定车辆师傅，则通知附近十公里闲置的师傅
          }).catch(err => {
            console.log(err)
            this.downloadLoading = false
            this.$message.error("订单创建失败，请稍后再试")
          })
        }
      })
    },
    /**
     * 查询附近的救援师傅并短信通知
     */
    toNotice(latitude,langitude){
      let self = this
      Bmob_QueryLocation('userInfo',latitude,langitude,10,'location','0').then(res => {
        if(res.length > 0){
          //  附近有师傅
          for(let i =0;i<res.length;i++){
            //  发送短信
            (function(j){
              sendMsg(res[i].username,'救援').then(da => {
                console.log(da)
                self.$mptoast('已通知附近救援师傅，请耐心等候')
              })
            })(i);
          }
        }
      }).catch(err => {
        console.log(err)
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
          console.log(this.rowInfo)
          if(this.rowInfo.amount == '' || this.rowInfo.amount ==0){
            this.$message({ type: 'warning', message: '订单金额不能为空' })
            return
          }
          this.downloadLoading = true
          Bmob_Update('Order',this.rowInfo.objectId,{'status':this.rowInfo.status, 'amount':parseFloat(this.rowInfo.amount)}).then(()=> {
            this.$message({ type: 'success', message: '订单更新成功'})
            this.dialogFormVisible = false
            this.downloadLoading = false
            this.getList()
          }).catch(e => {
            this.downloadLoading = false
            this.$message.error("订单更新失败")
          })
          if(this.rowInfo.status == '4' || this.rowInfo.status == '-1'){
            //  更改车主状态
            Bmob_Update('userInfo',this.rowInfo.carUser.objectId,{'status':'0'}).then(()=> {})
          }
          if(this.rowInfo.status == '-1' && !!this.rowInfo.carUser && this.rowInfo.carUser.nickName){
            //  短信通知救援车主
            sendSmsCode(this.rowInfo.carUser.username,'订单取消').then(tt => {
              //  更改师傅状态
              Bmob_Update('userInfo',this.rowInfo.carUser.objectId,{'status':'0'}).then(n => {

              })
            }).catch(err => {
              //  短信告知师傅失败
            })
          }
          // if(this.rowInfo.status == '4'){
          //   //  提示
          //   this.$confirm('确定要完成救援吗, 是否继续?', '提示', {
          //     confirmButtonText: '确定',
          //     cancelButtonText: '取消',
          //     type: 'warning'
          //   }).then(() => {

          //     this.$message({
          //       type: 'success',
          //       message: '删除成功!'
          //     });
          //   }).catch(() => {
          //     this.$message({
          //       type: 'info',
          //       message: '已取消删除'
          //     });
          //   });
          // }
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

<style lang="scss">
.pagination-container{
  text-align: center;
}
.el-date-editor .el-range-separator{
  padding: 0;
}
.my-autocomplete {
  li {
    line-height: normal;
    padding: 7px;

    .name {
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .addr {
      font-size: 12px;
      color: #b4b4b4;
    }

    .highlighted .addr {
      color: #ddd;
    }
  }
}
</style>
