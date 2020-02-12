/* No.15 朝向正确 */
function checkDirection(lot, lane){
    let pointsArray=lot.corners;
    // 起点终点
    if (pointsArray[0] != pointsArray[4]){
        return false;
    }

    // 角点逆时针
    let v1 = [pointsArray[1].x - pointsArray[0].x, pointsArray[1].y - pointsArray[0].y];
    let v2 = [pointsArray[2].x - pointsArray[1].x, pointsArray[2].y - pointsArray[1].y];
    let v3 = [pointsArray[3].x - pointsArray[2].x, pointsArray[3].y - pointsArray[2].y];
    let v4 = [pointsArray[4].x - pointsArray[3].x, pointsArray[4].y - pointsArray[3].y];
    let cross1 = (v1[0] * v2[1]) - (v1[1] * v2[0]);
    let cross2 = (v3[0] * v4[1]) - (v3[1] * v4[0]);

    //若叉乘不同为负，则不是连续的逆时针
    if (!(cross1 > 0 && cross2 > 0)){
        return false;
    }

    //判断0和3是否靠近路边线
    
}

export{
    checkDirection,

}