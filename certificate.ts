import express from "express" ;
import bodyParser from "body-parser" ;
import pdfkit from "pdfkit" ;
import moment from "moment" ;
import fs from "fs" ;
import { replaceNumberTH } from "./string_replace" ;

const app = express() ;

app.use(bodyParser.json()) ;
app.use(bodyParser.urlencoded({extended : true})) ;

app.post('/certificate', async(req, res) => {

    let user_id = req.body.user_id ;
    let name_prefix_th = req.body.name_prefix_th ;
    let name_prefix_en = req.body.name_prefix_en ;
    let name_th = req.body.name_th ;
    let name_en = req.body.name_en ;
    let course = req.body.course ;
    let nationid = req.body.nationid ;
    let score = req.body.score ;
    let referrer = req.body.referrer ;
    let code = req.body.code ;

    let messageArray:string[] = new Array() ;

    if(!user_id || !name_prefix_th || !name_prefix_en || !name_th || !name_en  || !course || !nationid || !score || !referrer ||!code)
    {
        if(!user_id) 
        {
            messageArray.push('user_id is require') ;
        }
        if(!name_prefix_th)
        {
            messageArray.push('name_prefix_th is require') ;
        }
        if(!name_prefix_en)
        {
            messageArray.push('name_prefix_en is require') ;
        }
        if(!name_th)
        {
            messageArray.push('name_th is require') ;
        }
        if(!name_en)
        {
            messageArray.push('name_en is require') ;
        }
        if(!course)
        {
            messageArray.push('course is require') ;
        }
        if(!nationid)
        {
            messageArray.push('nationid is require') ;
        }
        if(!score)
        {
            messageArray.push('score is require') ;
        }
        if(!referrer)
        {
            messageArray.push('referrer is require') ;
        }
        if(!code)
        {
            messageArray.push('code is require') ;
        }
        res.status(400).send({message: messageArray}) ;
    }
    else
    {
        await genarateCertificateTH(null,null,req.body) ;
        await genarateCertificateEN(null,null,req.body) ;
        
        res.send(
        {
            url_th : 'http://e-academy.qerp.services/api/contents/certificate/th/'+user_id+'/'+referrer+'_'+nationid+'.pdf',
            url_en : 'http://e-academy.qerp.services/api/contents/certificate/en/'+user_id+'/'+referrer+'_'+nationid+'.pdf'
        })
    }
})

function genarateCertificateTH(data:any, end:any, body:any) {

    moment.locale('th') ;
    let user_id = body.user_id ;
    let name_th = body.name_th ;
    let course_th = body.course_th ;
    let nationid = body.nationid ;
    let score = body.score ;
    let date = moment().format('D MMMM YYYY') ;
    let referrer = body.referrer ;
    let code = body.code ;

    nationid = replaceNumberTH(nationid) ; // replace thai number
    score = replaceNumberTH(score)         // replace thai number
    date = replaceNumberTH(date) ;         // replace thai number

    const doc = new pdfkit(
        {
            layout : 'landscape',
            size: [595.28, 841.89], // Size A4
            margins : { // by default, all are 72
               top: 72,
               bottom: 0,
               left: 10,
               right: 10
            }
        })

    // Font
    const font_THSarabun = 'font/4th-sarabun-psk/THSarabun.ttf' ;
    const font_THSarabun_Bold = 'font/4th-sarabun-psk/THSarabun Bold.ttf' ;
    const font_Sukhumvit = 'font/SukhumvitSet/SukhumvitSet-Text.ttf' ;
    
    // Response With PDF File
    if(data && end)
    {
        doc.on('data', data) ;
        doc.on('end', end) ;
    }

    doc.image('image/NEA_noText.png', 0, 0, {
        width: doc.page.width, 
        height: doc.page.height,
    }).moveDown(5.5)
    .font(font_Sukhumvit).fontSize(14).text('ประกาศนียบัตรใบนี้ให้ไว้เพื่อแสดงว่า',{
        align: 'center'
    }).moveDown(1.5)
    // ชื่อ - นามสกุล
    .font(font_THSarabun_Bold).fontSize(28).text('คุณ '+ name_th,{
        align: 'center'
    }).moveDown(1.25)
    .font(font_THSarabun).fontSize(18).text('ได้ผ่านการฝึกอบรมออนไลน์',{
        align: 'center'
    }).moveDown(1.25)
    // คอร์ส
    .font(font_THSarabun_Bold).fontSize(28).text(course_th,{
        align: 'center'
    }).moveDown(1)
    // เลขบัตรประชาชน , คะแนน
    .font(font_THSarabun).fontSize(18).text('เลขบัตรประชาชน  '+nationid+'   ด้วยผลการเรียนร้อยละ  '+score,{
        align: 'center'
    }).moveDown(0.75)
    // วันที่
    .font(font_THSarabun).fontSize(18).text('ให้ไว้ ณ วันที่   '+date,{
        align: 'center'
    })
    
    // Signature image
    .image('image/signature.png', 345, 475, {
        width: 130,
        height: 50
    })
    // Signature text
    .font(font_THSarabun).fontSize(12).text('(นาย สมเด็จ สุสมบูรณ์)', 375, 507)
    .font(font_Sukhumvit).fontSize(15).text('อธิบดีกรมส่งเสริมการค้าระหว่างประเทศ กระทรวงพาณิชย์', 245, 525)

    // Code
    .font(font_THSarabun_Bold).fontSize(18).fillColor('gray').text(code, 25, 570)

    // Check directory path
    if(!fs.existsSync('./storage/th/'+body.user_id))
    {
        fs.mkdirSync('./storage/th/'+body.user_id) ;
    }
    // Write Pdf file to this path
    doc.pipe(fs.createWriteStream('./storage/th/'+user_id+'/'+referrer+'_'+body.nationid+'.pdf'))

    doc.end() ;
}

function genarateCertificateEN(data:any, end:any, body:any) {

    moment.locale('en') ;
    let user_id = body.user_id ;
    let name_prefix = body.name_prefix ;
    let name = body.name ;
    let course = body.course ;
    let nationid = body.nationid ;
    let score = body.score ;
    let date = moment().format('D MMMM YYYY') ;
    let referrer = body.referrer ;
    let code = body.code ;

    const doc = new pdfkit(
        {
            layout : 'landscape',
            size: [595.28, 841.89], // Size A4
            margins : { // by default, all are 72
               top: 72,
               bottom: 0,
               left: 10,
               right: 10
            }
        })
    const font_THSarabun = 'font/4th-sarabun-psk/THSarabun.ttf' ;
    const font_THSarabun_Bold = 'font/4th-sarabun-psk/THSarabun Bold.ttf' ;

    if(data && end)
    {
        doc.on('data', data) ;
        doc.on('end', end) ;
    }

    doc.image('image/NEA_noText.png', 0, 0, {
        width: doc.page.width, 
        height: doc.page.height,
    }).moveDown(5.5)
    .font(font_THSarabun_Bold).fontSize(36).text('Certification of Participation', {
        align: 'center'
    }).moveDown(0.1)
    .font(font_THSarabun).fontSize(20).text('This is to certify that', {
        align: 'center'
    }).moveDown(1.25)
    // ชื่อ - นามสกุล
    .font(font_THSarabun_Bold).fontSize(32).text(name_prefix+' '+name, {
        align: 'center'
    }).moveDown(1)
    .font(font_THSarabun).fontSize(22).text('has successfully participated in E-Academy online courses', {
        align: 'center'
    }).moveDown(0.5)
    // คอร์ส
    .font(font_THSarabun_Bold).fontSize(30).text(course, {
        align: 'center'
    }).moveDown(0.5)
    // เลขบัตรประชาชน , คะแนน
    .font(font_THSarabun).fontSize(22).text('National ID '+nationid + '  Academic result ' + score + ' %', {
        align: 'center'
    }).moveDown(0.5)
    // วันที่
    .font(font_THSarabun).fontSize(22).text('on '+date, {
        align: 'center'
    })

    // Signature image
    .image('image/signature.png', 345, 500, {
        width: 130,
        height: 50
    })
    // Signature text
    .font(font_THSarabun).fontSize(12).text('Mr.Somdet Susomboon', 370, 535)

    // Code
    .font(font_THSarabun_Bold).fontSize(18).fillColor('gray').text(code, 25, 570)

    // Check directory path
    if(!fs.existsSync('./storage/en/'+body.user_id))
    {
        fs.mkdirSync('./storage/en/'+body.user_id) ;
    }
    // Write Pdf file to this path 
    doc.pipe(fs.createWriteStream('./storage/en/'+user_id+'/'+referrer+'_'+body.nationid+'.pdf'))

    doc.end() ;
}

const port = 8008
app.listen(port, () => {
    console.log(`Server Is Running On Port ${port}`)
})