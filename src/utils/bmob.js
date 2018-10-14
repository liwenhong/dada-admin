import Bmob from "hydrogen-js-sdk";
const debug = true
/**
 * 初始化
 */
export function Bmob_Init(){
  console.log('bmob init ......')
  Bmob.initialize("1245fbae9dd53f523ac14b293ee5dc60", "590809d4a7db3777c5647c2f8f17fd88","7231ab8e05f13a9bb6d1d3018a9b497f");
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
export function Bomb_Search(table,params,size=20,page = 1,time,include){
  console.log(page,'....',size)
  return new Promise(async (resolve,reject) => {
    const query = Bmob.Query(table);
    if(!!include){
      query.include(include.key,include.value)
    }else{
      query.include('carUser','userInfo')
    }
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
      console.log(error)
      reject(error)
    })
  })
}

export function Bmob_QueryMoneyFlow(table,params,contantIn,size,page,time){
  return new Promise(async (resolve,reject) => {
    const query = Bmob.Query(table)
    for(let key in params){
      query.equalTo(key,"==", params[key])
    }
    for(let i =0;i<contantIn.length;i++){
      query.statTo("where", '{"user":{"$inQuery":{"where":{"objectId":"'+contantIn[i].objectId+'"},"className":"_User"}}}');
    }
    // query.containedIn("user", contantIn);
    if(!!time && time.length>0){
      query.equalTo("createdAt", ">", time[0]);
      query.equalTo("createdAt", "<", time[1]);
    }
    query.limit(size);
    query.skip((page-1)*size);
    query.order("-updatedAt");
    let temp = {}
    await query.count().then(q => {
      temp.count = q
    })
    query.find().then(res => {
      debug && console.log(res)
      temp.data = res
      resolve(temp)
    }).catch(err => {
      console.log(err)
      reject(err)
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
export function Bmob_UploadImg(name,item){
  return new Promise((resolve,reject) => {
    let file = Bmob.File(name, item);
    file.save().then(res => {
      console.log(res.length);
      console.log(res);
      resolve(res)
    }).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}

/**
 * 获取用户最新信息
 */
export function getUserNewInfo(){
  return new Promise((resolve,reject) => {
    resolve(Bmob.User.current())
  })
}
/**
 * 注册
 * @param data 用户注册数据
 */
export function register(data,type = true){
  return new Promise((resolve,reject) => {
    let params = {
      username: data.mobile,
      password: data.pwd,
      phone: data.mobile,
      status: data.status,
      nickName:!!data.nickName?data.nickName:'',
    }
    if(!!data.carInfo){
      params.carInfo = data.carInfo
    }
    Bmob.User.register(params).then(res => {
      console.log(res)
      if(type){
        //  注册成功后往userInfo表里添数据
        const pointer = Bmob.Pointer('_User')
        const poiID = pointer.set(res.objectId)
        let da = {
          username: data.mobile,
          status: '0',
          type: '2',
          user: poiID,
          nickName:!!data.nickName?data.nickName:'',
          carNumber: !!data.carNumber?data.carNumber:''
        }
        if(!!data.company){
          da.company = data.company
        }
        Bomb_Add('userInfo', da).then(t => {
          res.uObjectId = t.objectId
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      }else{
        resolve(res)
      }
    }).catch(err => {
      console.log(err)
      reject(err)
    });
  })
}

/**
 * 根据条件查询数据
 * @param table 表名称
 * @param params 查询参数
 */
export function Bomb_Search2(table,params){
  return new Promise((resolve,reject) => {
    const query = Bmob.Query(table);
    for(let key in params){
      query.equalTo(key,"==", params[key])
    }
    query.order("-updatedAt");
    query.find().then(t => {
      debug && console.log(t)
      resolve(t)
    }).catch(error => {
      reject(error)
    })
  })
}

 /**
 * 创建地理位置
 * @param latitude 纬度
 * @param longitude 经度
 */
export function Bmob_CreateLocation(latitude,longitude){
  return Bmob.GeoPoint({ latitude: latitude,longitude: longitude })
}
/**
 * 删除记录
 * @param {表名} table
 * @param {ID} objectId
 */
export function del(table,objectId){
  return new Promise((resolve,reject) => {
    const query = Bmob.Query(table);
    query.destroy(objectId).then(res => {
      console.log(res)
      resolve(res)
    }).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}
/**
 * 根据地理位置查询附近救援师傅
 * @param table 表名
 * @param latitude 维度
 * @param langitude 经度
 * @param km 范围
 * @param key 地理位置字段名
 * @param status 师傅状态
 */
export function Bmob_QueryLocation(table,latitude,langitude,km = 10,key,status){
  return new Promise((resolve,reject) => {
    const point = Bmob.GeoPoint({ latitude: latitude,longitude: langitude })
    const query = Bmob.Query(table);
    query.withinKilometers(key, point, km);  //10指的是公里
    query.equalTo('status','==',status)
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
 * 批量修改
 * @param {*} table
 * @param {*} params
 * @param {*} params2
 */
export function Bmob_updateAll(table,params,params2){
  return new Promise((resolve,reject) => {
    const query = Bmob.Query(table);
    for(let key in params){
      query.equalTo(key,"==", params[key])
    }
    query.find().then(todos => {
      for(let key in params2){
        todos.set(key, params2[key]);
      }
      todos.saveAll().then(res => {
        // 成功批量修改
        console.log(res,'ok')
        resolve('ok')
      }).catch(err => {
        console.log(err)
        reject(err)
      });
    })
  })

}
