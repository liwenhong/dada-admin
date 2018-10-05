import Bmob from "hydrogen-js-sdk";
const debug = true
/**
 * 初始化
 */
export function Bmob_Init(){
  console.log('bmob init ......')
  Bmob.initialize("1245fbae9dd53f523ac14b293ee5dc60", "590809d4a7db3777c5647c2f8f17fd88");
}

/**
 * 登录
 */
export function Bmob_Login(username,password){
  return new Promise((resolve,reject) => {
    Bmob.User.login(username,password).then(res => {
      debug && console.log(res)
      if(!!res.isCompany || (!!res.roles && res.roles.length>0)){
        resolve(res)
      }else{
        reject('error')
      }
      }).catch(err => {
        console.log(err)
        reject(err)
    });
  })
}
/**
 * 退出登录
 */
export function Bmob_LogOut(){
  return new Promise((resolve,reject) => {
    Bmob.User.logout()
    resolve()
  })
}

/**
 * 获取当前用户信息
 */
export function getCurrentInfo(){
  return new Promise((resolve,reject) => {
    let current = Bmob.User.current()
    resolve(current)
  })
}
/**
 * 发送短信验证码
 * @param mobile 电话号码
 * @param template 短信模版名称
 */
export function sendSmsCode(mobile,template){
  return new Promise((resolve,reject) =>{
    let params = {
      mobilePhoneNumber: mobile, //string
      template: template
    }
    Bmob.requestSmsCode(params).then((response) => {
      response && resolve(response)
    })
    .catch((error) =>  {
      reject(error)
      console.log(error);
    });
  })
}
/**
 * 查询--通过主键获取一行记录
 * @param {表名称} table
 * @param {主键id} objectId
 */
export function Bmob_QueryByObjectId(table,objectId){
  return new Promise((resolve,reject) => {
    const query = Bmob.Query(table);
    query.get(objectId).then(res => {
    debug && console.log(res)
    resolve(res)
    }).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}
/**
 * 修改一行记录
 * @param {表名称} table
 * @param {主键ID} objectId
 */
export function Bmob_Update(table,objectId,params){
  return new Promise((resolve,reject) => {
    const query = Bmob.Query(table);
    query.get(objectId).then(res => {
      debug && console.log(res)
      for(let key in params){
        res.set(key, params[key])
      }
      res.save()
      resolve()
    }).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}
 /**
 * 根据条件查询数据
 * @param table 表名称
 * @param params 查询参数
 */
export function Bomb_Search(table,params,size=20,page = 1,time){
  console.log(page,'....',size)
  return new Promise(async (resolve,reject) => {
    const query = Bmob.Query(table);
    query.include('carUser','userInfo')
    for(let key in params){
      query.equalTo(key,"==", params[key])
    }
    if(!!time && time.length>0){
      query.equalTo("createdAt", ">", time[0]);
      query.equalTo("createdAt", "<", time[1]);
    }
    query.limit(size);
    query.skip((page-1)*size);
    query.order("-updatedAt");
    // query.count(1);
    let temp = {}
    await query.count().then(q => {
      console.log(q)
      temp.count = q
    })
    query.find().then(t => {
      debug && console.log(t)
      temp.data = t
      resolve(temp)
    }).catch(error => {
      reject(error)
    })
  })
}

/**
 * 添加数据
 * @param table 表名
 * @param params 参数
 */
export function Bomb_Add(table,params){
  return new Promise((resolve,reject) => {
    const query = Bmob.Query(table);
    for(let key in params){
      query.set(key, params[key])
    }
    query.save().then(res => {
      debug && console.log(res)
      resolve(res)
    }).catch(err => {
      debug && console.log(err)
      reject(err)
    })
  })
}
/**
 * 查询Pointer 关联表数据
 * @param table 表名
 * @param params 参数
 */
export function Bmob_IncludeQuery(table,params,include){
  return new Promise((resolve,reject) => {
    const query = Bmob.Query(table);
    query.include(include.key,include.value)
    for(let key in params){
      query.equalTo(key,'==',params[key])
    }
    query.find().then(res => {
      debug && console.log(res)
      resolve(res)
    }).catch(err => {
      debug && console.log(err)
      reject(err)
    })
  })
}
/**
 * 创建数据关联表
 * @param table 表名
 * @param objectId ID
 */
export function Bmob_CreatePoint(table,objectId){
  const pointer = Bmob.Pointer(table)
  const poiID = pointer.set(objectId)
  return poiID
}
