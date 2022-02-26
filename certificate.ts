import express from "express" ;
import bodyParser from "body-parser" ;
import pdfkit from "pdfkit" ;
import moment from "moment" ;
import fs from "fs" ;
import { replaceNumberTH } from "./string_replace" ;

const app = express() ;

app.use(bodyParser.json()) ;
app.use(bodyParser.urlencoded({extended : true})) ;

app.get('/', async (req, res) => {
    res.send(`
    <form action="http://localhost:8008/certificate/TH" method="post">
        <input type="hidden" name="name" value="ศิรภัทร สุขประเสริฐ">
        <input type="hidden" name="course" value="หลักสูตรกระบวนคิดเชิงออกแบบ">
        <input type="hidden" name="id" value="1103701674491">
        <input type="hidden" name="score" value="100">
        <input type="hidden" name="code" value="QWE123RTYU">
        <input type="submit" value="Certificate_TH" />
    </form>
    <form action="http://localhost:8008/certificate/EN" method="post">
        <input type="submit" value="Certificate_EN" />
    </form>
  `);
})

app.post('/certificate', async(req, res) => {

    let user_id = req.body.user_id ;
    let name_prefix_th = req.body.name_prefix_th ;
    let name_prefix_en = req.body.name_prefix_en ;
    let firstname_th = req.body.firstname_th ;
    let lastname_th = req.body.lastname_th ;
    let firstname_en = req.body.firstname_en ;
    let lastname_en = req.body.lastname_en ;
    let course_th = req.body.course_th ;
    let course_en = req.body.course_en
    let nationid = req.body.nationid ;
    let score = req.body.score ;
    let referrer = req.body.referrer ;
    let code = req.body.code ;

    let messageArray:string[] = new Array() ;

    if(!user_id || !name_prefix_th || !name_prefix_en || !firstname_th || !lastname_th || !firstname_en || !lastname_en || !course_th || !course_en || !nationid || !score || !referrer ||!code)
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
        if(!firstname_th)
        {
            messageArray.push('firstname_th is require') ;
        }
        if(!lastname_th)
        {
            messageArray.push('lastname_th is require') ;
        }
        if(!firstname_en)
        {
            messageArray.push('firstname_en is require') ;
        }
        if(!lastname_en)
        {
            messageArray.push('lastname_en is require') ;
        }
        if(!course_th)
        {
            messageArray.push('course_th is require') ;
        }
        if(!course_en)
        {
            messageArray.push('course_en is require') ;
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
        if(score >= 70)
        {
            await generateQRCode(user_id,code) ;
            await genarateCertificateTH(null,null,req.body) ;
            await genarateCertificateEN(null,null,req.body) ;
            res.send(
            {
                url_th : 'http://e-academy.qerp.services/api/contents/certificate/th/'+user_id+'/'+referrer+'_'+nationid+'.pdf',
                url_en : 'http://e-academy.qerp.services/api/contents/certificate/en/'+user_id+'/'+referrer+'_'+nationid+'.pdf'
            })
        }
        else
        {
            console.log('can not genarate certificate T-T : (score < 70)') ;
            res.send(
            {
                url_th : '',
                url_en : ''
            })
        }
    
    }
})

app.post('/offline', (req, res) => {
    genarateCertificateOfflineTH(null,null,req.body) ;
    res.send('success genarate Certificate Offline') ;
})

function generateQRCode(id:any, code:any) {
    return new Promise((resolve)=>{
    // Check directory path
    if(!fs.existsSync('./storage/'+id))
    {
        fs.mkdirSync('./storage/'+id) ;
    }
    if(!fs.existsSync(`./storage/${id}/qr`))
    {
        fs.mkdirSync(`./storage/${id}/qr`) ;
    }
    
    const QRCode = require('qrcode') ;

    QRCode.toFile(`./storage/${id}/qr/${code}.png`, `https://e-academy.ditp.go.th/check_certificate?code=${code}`, {
        color: {
            dark: '#2065af',  
            light: '#0000' // Transparent background
        }
    }).then(() => {
        console.log('QR genarate success') ;
        resolve('')
       })
    })
}

function genarateCertificateTH(data:any, end:any, body:any) {

    moment.locale('th') ;
    let user_id = body.user_id ;
    let firstname_th = body.firstname_th ;
    let lastname_th = body.lastname_th ;
    let course_th = body.course_th ;
    let nationid = body.nationid ;
    let score = body.score ;
    let date = moment().format('D MMMM YYYY') ;
    let referrer = body.referrer ;
    let code = body.code ;

    nationid = replaceNumberTH(nationid) ; // replace thai number
    score = replaceNumberTH(score) // replace thai number
    date = replaceNumberTH(date) ;  // replace thai number

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
    .font(font_THSarabun).fontSize(21).fillColor('gray').text('ประกาศนียบัตรใบนี้ให้ไว้เพื่อแสดงว่า',{
        align: 'center'
    }).moveDown(1.5)
    // ชื่อ - นามสกุล
    .font(font_THSarabun_Bold).fontSize(30).fillColor('black').text('คุณ '+ firstname_th+' '+lastname_th,{
        align: 'center'
    }).moveDown(1.25)
    .font(font_THSarabun).fontSize(21).text('ได้ผ่านการฝึกอบรมออนไลน์',{
        align: 'center'
    }).moveDown(0.75)
    // คอร์ส
    .font(font_THSarabun_Bold).fontSize(30).text('“'+course_th+'”',{
        align: 'center'
    }).moveDown(0.5)
    // เลขบัตรประชาชน , คะแนน
    .font(font_THSarabun).fontSize(21).text('เลขบัตรประชาชน  '+nationid+'   ด้วยผลการเรียนร้อยละ  '+score,{
        align: 'center'
    }).moveDown(0.75)
    // วันที่
    .font(font_THSarabun).fontSize(21).text('ให้ไว้ ณ วันที่   '+date,{
        align: 'center'
    })
    
    // Signature image
    .image('image/signature.png', 355, 465, {
        width: 130,
        height: 50
    })

    // E-certificate
    .font(font_THSarabun_Bold).fontSize(18).fillColor('gray').text('E-CERTIFICATE', 735,10)

    // Signature text
    .font(font_THSarabun_Bold).fontSize(14).fillColor('black').text('(นาย ภูสิต รัตนกุล เสรีเริงฤทธิ์)', 360, 507)
    .font(font_THSarabun).fontSize(21).fillColor('gray').text('อธิบดีกรมส่งเสริมการค้าระหว่างประเทศ กระทรวงพาณิชย์', 260, 525)

    // QR Code
    .image(`./storage/${user_id}/qr/${code}.png`, 30, 500, {width: 64, height: 64})
    // Code
    .font(font_THSarabun_Bold).fontSize(18).fillColor('gray').text(code, 25, 565)

    // Check directory path
    if(!fs.existsSync('./storage/'+user_id))
    {
        fs.mkdirSync('./storage/'+user_id) ;
    }
    if(!fs.existsSync('./storage/'+user_id+'/th'))
    {
        fs.mkdirSync('./storage/'+user_id+'/th') ;
    }

    // Write Pdf file to this path
    doc.pipe(fs.createWriteStream('./storage/'+user_id+'/th/'+referrer+'_'+body.nationid+'.pdf'))

    doc.end() ;
}

function genarateCertificateEN(data:any, end:any, body:any) {
    moment.locale('en') ;
    let user_id = body.user_id ;
    let name_prefix_en = body.name_prefix_en ;
    let firstname_en = body.firstname_en ;
    let lastname_en = body.lastname_en ;
    let course_en = body.course_en ;
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
    }).moveDown(1)
    // ชื่อ - นามสกุล
    .font(font_THSarabun_Bold).fontSize(32).text(name_prefix_en+' '+firstname_en+' '+lastname_en, {
        align: 'center'
    }).moveDown(0.75)
    .font(font_THSarabun).fontSize(22).text('has successfully participated in E-Academy online courses', {
        align: 'center'
    }).moveDown(0.5)
    // คอร์ส
    .font(font_THSarabun_Bold).fontSize(30).text('“'+course_en+'”', {
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
    .image('image/signature.png', 355, 470, {
        width: 130,
        height: 50
    })
    // Signature text
    .font(font_THSarabun_Bold).fontSize(14).text('Mr.Phusit Ratanakul Sereroengrit', 345, 515)
    .font(font_THSarabun_Bold).fontSize(14).text('Director General Department of International Trade Promotion', 275, 530)

    // QR Code
    .image(`./storage/${user_id}/qr/${code}.png`, 30, 500, {width: 64, height: 64})
    // Code
    .font(font_THSarabun_Bold).fontSize(18).fillColor('gray').text(code, 25, 570)

    // Check directory path
    if(!fs.existsSync('./storage/'+user_id))
    {
        fs.mkdirSync('./storage/'+user_id) ;
    }
    if(!fs.existsSync('./storage/'+user_id+'/en'))
    {
        fs.mkdirSync('./storage/'+user_id+'/en') ;
    }

    // Write Pdf file to this path 
    doc.pipe(fs.createWriteStream('./storage/'+user_id+'/en/'+referrer+'_'+body.nationid+'.pdf'))

    doc.end() ;
}

function genarateCertificateOfflineTH(data:any, end:any, body:any) {
    moment.locale('th') ;
    let user_id = 0 ;
    let firstname_th = "มู" ;
    let lastname_th = "สุวิชา" ;
    let course_th = "ความรู้เบื้องต้นในการประกอบธุรกิจส่งออก" ;
    let company_th = "บริษัท คอนเวอร์เจนซ์ เทคโนโลยี จำกัด" ;
    let date = "" ;
    let code = "QWERTYUIOP" ;
    let referrer = "QWERTY"


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
    const font_Sukhumvit = 'font/SukhumvitSet/SukhumvitSet-Text.ttf' ;
    const font_Sukhumvit_Bold = 'font/SukhumvitSet/SukhumvitSet-Bold.ttf'

    if(data && end)
    {
        doc.on('data', data) ;
        doc.on('end', end) ;
    }

    doc.image('image/NEA_noText.png', 0, 0, {
        width: doc.page.width, 
        height: doc.page.height,
    }).moveDown(5.5)
    .font(font_Sukhumvit_Bold).fontSize(30).text('กรมการส่งเสริมการค้าระหว่างประเทศ',{
        align: 'center'
    }).moveDown(0.5)
    .font(font_Sukhumvit_Bold).fontSize(20).text('ให้ไว้เพื่อแสดงว่า',{
        align: 'center'
    }).moveDown(0.5)
    // ชื่อ - นามสกุล
    .font(font_Sukhumvit).fontSize(18).text('คุณ '+firstname_th+' '+lastname_th,{
        align: 'center'
    }).moveDown(0.5)
    // ชื่อบริษัท
    .font(font_Sukhumvit).fontSize(18).text(company_th,{
        align: 'center'
    }).moveDown(0.5)
    .font(font_Sukhumvit_Bold).fontSize(20).text('ได้ผ่านการอบรมเชิงปฏิบัติการ หลักสูตร',{
        align: 'center'
    }).moveDown(0.5)
    // คอร์ส
    .font(font_Sukhumvit).fontSize(18).text('“'+course_th+'”',{
        align: 'center'
    }).moveDown(0.5)
    // วันที่
    .font(font_Sukhumvit).fontSize(18).text('ระหว่างวันที่',{
        align: 'center'
    }).moveDown(0.5)
    .font(font_Sukhumvit_Bold).fontSize(20).text('จัดโดย สถาบันพัฒนาผู้ประกอบการการค้ายุคใหม่',{
        align: 'center'
    })

    // QR Code
    //.image(`./storage/${user_id}/qr/${code}.png`, 30, 500, {width: 64, height: 64})
    // Code
    .font(font_THSarabun_Bold).fontSize(18).fillColor('gray').text(code, 25, 570)

    // Check directory path
    if(!fs.existsSync('./storage/'+user_id))
    {
        fs.mkdirSync('./storage/'+user_id) ;
    }
    if(!fs.existsSync('./storage/'+user_id+'/th'))
    {
        fs.mkdirSync('./storage/'+user_id+'/th') ;
    }

    // Write Pdf file to this path 
    doc.pipe(fs.createWriteStream('./storage/offline.pdf')) ;

    doc.end() ;
}

const port = 8008
app.listen(port, () => {
    console.log(`Server Is Running On Port ${port}`)
})