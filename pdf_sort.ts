const fs = require('fs') ;
const pdfParse = require('pdf-parse') ;

export function dirIdList() {
    let userIdArray = new Array() ;

    return new Promise((resolve:any) => {
        fs.readdir('./storage/',(err:any, dirId:any) => {
            if (err) {
                return console.log('error dirIdList',err) ;
            } 
            // list all userid directory
            dirId.forEach((id:any) => {
                userIdArray.push(id) ;
            });
        
            // Delete .DS_Store
            userIdArray = userIdArray.filter(data => data != '.DS_Store') ;
            console.log('user : ',userIdArray.length) ;
            resolve(userIdArray) ;
        })
    })
}

export function cerNameList(userIdArray:string[]) {
    let cerNameArray = new Array() ;

    return new Promise((resolve:any) => {
        // list all certificate file in userid directory
        for(let i=0 ; i<=userIdArray.length-1 ; i++)
        { 
            fs.readdir('./storage/'+userIdArray[i],(err:any, certificate:any) => {
                if(err) {
                    return console.log('error cerNameList',err) ;
                }
                certificate.forEach((cerName:any) => {
                    cerNameArray.push(cerName) ;
                    sorting(userIdArray[i],cerName) ;
                })
            })
        }
    })
}

export async function pdfSort(user_id:any) {

    fs.readdir('./storage/'+user_id,(err:any, certificate:any) => {
        console.log('certificate',certificate)
        if(err) {
            return console.log(err) ;
        }
        certificate.forEach((cerName:any) => {
            console.log('courseCode',cerName.split('-')[0]) ;
            let courseCode = cerName.split('-')[0] ;
            console.log(sorting(user_id,cerName)) ;
        })
    })
}
 
var count = 0 ;
export async function sorting(user_id:any, cerName:any) {
    let pdfFile = fs.readFileSync('./storage/'+user_id+'/'+cerName) ;
    var sortKeywordTH = "คุณ" ;
    var sortKeywordEN = "has successfully" ;
    var sortArray = new Array() ;
    var sortResult:any ;

    await pdfParse(pdfFile).then(async function (data:any) {
        sortArray = data.text.split('\n') ;
        // console.log('sortArray',sortArray) ;

        // for(let i=0 ; i<=sortArray.length-1 ; i++)
        // {
        //     if(sortArray[i].search(sortKeywordTH) == 0)
        //     {
        //         sortResult = 'th'
        //         break
        //     }
        //     else if(sortArray[i].search(sortKeywordEN) == 0)
        //     {
        //         sortResult = 'en'
        //         break
        //     }
        //     else
        //     {
        //         sortResult = 'other'
        //     }
        // }
    
        // if(sortResult == 'th')
        // {
        //     if(!fs.existsSync('./storage/'+user_id+'/th'))
        //     {
        //        await fs.mkdirSync('./storage/'+user_id+'/th') ;
        //     }
        //     const moveFile = require('fs').promises ;
        //     moveFile.rename('./storage/'+user_id+'/'+cerName, './storage/'+user_id+'/th/'+cerName)
        //     .then(() => {
        //         console.log('Sorting successfully');
        //     })
        // }
        // else if(sortResult == 'en')
        // {
        //     if(!fs.existsSync('./storage/'+user_id+'/en'))
        //     {
        //         await fs.mkdirSync('./storage/'+user_id+'/en') ;
        //     }
        //     const moveFile = require('fs').promises ;
        //     moveFile.rename('./storage/'+user_id+'/'+cerName, './storage/'+user_id+'/en/'+cerName)
        //     .then(() => {
        //         console.log('Sorting successfully');
        //     })
        // }
        // else if(sortResult == 'other')
        // {
        //     if(!fs.existsSync('./storage/'+user_id+'/other'))
        //     {
        //         await fs.mkdirSync('./storage/'+user_id+'/other') ;
        //     }
        //     const moveFile = require('fs').promises ;
        //     moveFile.rename('./storage/'+user_id+'/'+cerName, './storage/'+user_id+'/other/'+cerName)
        //     .then(() => {
        //         console.log('Sorting successfully');
        //     })
        // }
    })
    // get certificate code from pdf
    if(sortArray[sortArray.length-1].search('CODE:') == 0)
    {
        console.log("code : ",sortArray[sortArray.length-1].split("CODE:")[1]) ;
        var cerCode = sortArray[sortArray.length-1].split("CODE:")[1] ;
    }
    else
    {
        console.log("Code Not Found") ;
        count++ ;
    }
    console.log(count)
}

async function test() {
   let userIdArray:any = await dirIdList() ;
   await cerNameList(userIdArray) ;
}

test() ;
