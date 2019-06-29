function DBClass(DBname) {
    this.DBname = DBname;
    this.startIdx= 1;
    this.endIdx = 1000;
    this.j = 0;
    this.totalCount = -1002;
    this.debugSum = 0;
  };
  
  var proto = DBClass.prototype;
  
  proto.setDBName = function(DBname){
    this.DBname = DBname;
  };
  
  proto.getDBName = function() {
    return this.DBname;
  };
  
  proto.setStartIdx = function(startIdx) {
    this.startIdx = startIdx;
  };
  
  proto.getStartIdx = function() {
    return this.startIdx;
  };
  
  proto.setEndIdx = function(endIdx){
    this.endIdx = endIdx;
  };
  
  proto.getEndIdx = function() {
    return this.endIdx;
  };
  
  proto.setJ = function(j) {
    this.j = j;
  };
  
  proto.getJ = function() {
    return this.j;
  };

  proto.setTotalCount = function(totalCount) {
    this.totalCount = totalCount;
  };
  
  proto.getTotalCount = function() {
    return this.totalCount;
  };

  proto.setDebugSum = function(debugSum) {
    this.debugSum += debugSum;
  };
  
  proto.getDebugSum = function() {
    return this.debugSum;
  };
  
  module.exports = DBClass;