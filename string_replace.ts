const replace = require('str-replace');

export function replaceNumberTH(data:string) {
    for(let i=0 ; i<=9 ; i++)
    {
        var checkString:string = String(i) ;
        var replaceList:string[] = ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙'] ;
        var dataReplace = replace.all(checkString).from(data).with(replaceList[i]) ;
        data = dataReplace ;
    }
    return data ;
}
