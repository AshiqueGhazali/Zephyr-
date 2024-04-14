const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req,file,callBack)=>{
        callBack(null,'./public/assets/categoryImg')
    },
    filename:(req,file,callBack)=>{
        const ext = path.extname(file.originalname)
        const fileName = file.originalname.replace(ext, '')
        callBack(null, `${fileName}-${Date.now()}${ext}`)
    }
})

const upload =multer({storage:storage,limits:{'files':4}})

module.exports=upload