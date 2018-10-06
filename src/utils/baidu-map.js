const coordtransform=require('coordtransform');
  /**
   * 国测局坐标转百度经纬度坐标
   * @param {维度} lat
   * @param {精度} lng
   */
  export function transferLocation(lat,lng){
    return new Promise((resolve,reject) => {
      //wgs84转国测局坐标
      // let temp = coordtransform.wgs84togcj02(lng, lat)
      // let gcj02tobd09=coordtransform.gcj02tobd09(temp[0], temp[1]);
      resolve([lng,lat])
    })

  }
  /**
   * 逆地址解析服务--通过经纬度获取地理位置
   * @param langitude 经度
   * @param latitude 维度
   */
  export function getAddressByPoint(langitude,latitude){
    return new Promise((resolve,reject) => {
      let myGeo = new BMap.Geocoder();
      myGeo.getLocation(new BMap.Point(langitude, latitude), function(result){
        if (result){
          resolve(result)
        }
      });
    })
  }
  /**
   * 根据两地经纬度获取两地之间多距离以及时间
   * @param latitude1 起点纬度
   * @param langitude1 起点经度
   * @param latitude2 终点纬度
   * @param langitude2 终点经度
   */
  export function getDistanceByPoint(latitude1,langitude1,latitude2,langitude2,el){
    return new Promise((resolve,reject) => {
      let pointA = new BMap.Point(langitude1,latitude1); // 创建点坐标A
      let pointB = new BMap.Point(langitude2,latitude2); // 创建点坐标B
      var map = new BMap.Map(el);
      var options = {
          onSearchComplete: function(results){
              if (driving.getStatus() == 0){
                  // 获取第一条方案
                  let plan = results.getPlan(0);
                  // 获取方案的驾车线路
                  let durtion = plan.getDuration(false)/60;
                  let distance = plan.getDistance(true)
                  let data ={
                    durtion:durtion.toFixed(1)+'分钟',
                    distance: distance
                  }
                  resolve(data)
              }else{
                reject('error')
              }
          }
      };
      var driving = new BMap.DrivingRoute(map, options);
      driving.search(pointA, pointB);
    })
  }
  /**
   * 关键词搜索地点
   * @param {关键词} keyword
   */
  export function searchPlace(keyword,city='长沙市'){
    return new Promise((resolve,reject) => {
      // map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);
      var options = {
        onSearchComplete: (results) =>{
          // 判断状态是否正确
          if (local.getStatus() == BMAP_STATUS_SUCCESS){
            var s = [];
            for (var i = 0; i < results.getCurrentNumPois(); i ++){
              s.push(results.getPoi(i));
            }
            console.log(s)
            resolve(s)
          }else{
            reject('error')
          }
        }
      };
      var local = new BMap.LocalSearch(city, options);
      local.search(keyword);
    })
  }

