
function updateLabel(input) {
    var label = input.nextElementSibling;
    var selectedImagesContainer = document.getElementById('selectedImagesContainer');

    if (!selectedImagesContainer) {
        console.error("Selected images container not found.");
        return;
    }

    if (input.files.length > 0) {
        for (var i = 0; i < input.files.length; i++) {
            var imageName = input.files[i].name;
            var imageElement = document.createElement('img');
            imageElement.src = URL.createObjectURL(input.files[i]);
            imageElement.width = 120;
            imageElement.height = 120;

            var imageNameElement = document.createElement('p');
            imageNameElement.textContent = imageName;

            var removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.className = 'btn btn-sm btn-danger';
            removeButton.style.marginLeft = '5px'; 
            removeButton.onclick = function() {
                removeImage(imageElement);
            };

            var imageContainer = document.createElement('div');
            imageContainer.style.marginBottom = '5px'; 
            imageContainer.appendChild(imageElement);
            imageContainer.appendChild(imageNameElement);
            imageContainer.appendChild(removeButton);
            selectedImagesContainer.appendChild(imageContainer);
        }
        label.innerText = 'Files selected';
    } else {
        label.innerText = 'Choose files';
    }
}

function removeImage(imageElement) {
    var input = document.getElementById('image');
    var selectedImagesContainer = document.getElementById('selectedImagesContainer');

    for (var i = 0; i < input.files.length; i++) {
        if (URL.createObjectURL(input.files[i]) === imageElement.src) {
            input.files = Array.from(input.files).filter(function(_, index) {
                return index !== i;
            });
            break;
        }
    }

    imageElement.parentNode.remove();

    if (input.files.length === 0) {
        var label = input.nextElementSibling;
        label.innerText = 'Choose files';
    }
}



//! discount calculation in add and edit Product >>

    function calculateDiscount() {
        var OriginalPriceInput = document.getElementById('mrp').value;
        var discountPriceInput = document.getElementById('discountPrice').value;
        
        var discountPrice = parseFloat(discountPriceInput);
        var OriginalPrice = parseFloat(OriginalPriceInput);
        
        
        if (!isNaN(discountPrice) && !isNaN(OriginalPrice)) {
            var discountPercentage = ((OriginalPrice - discountPrice) / OriginalPrice) * 100;
            console.log(discountPercentage);
            document.getElementById('discount').value = parseInt(discountPercentage);
        }
    }



    function clearForm() {
        var form = document.getElementById("myForm");
        form.reset(); 
      }


    function updateLabelImg(input) {
        var label = input.nextElementSibling;
        if (input.files.length > 0) {
          label.innerText = input.files[0].name;
        } else {
          label.innerText = "Choose file";
        }
      }

// ! Product form validation >>
    function validateForm() {
        var productName = document.getElementById('productName').value;
        var brandName = document.getElementById('brandName').value;
        var model = document.getElementById('model').value;
        var dialColor = document.getElementById('dialColor').value;
        var strapColor = document.getElementById('strapColor').value;
        var inStock = document.getElementById('inStock').value;
        var mrp = document.getElementById('mrp').value;
        var discountPrice = document.getElementById('discountPrice').value;
        const validationMessage = document.getElementById('validationMessages')
        

        
        if (!productName || productName[0]==' ') {
            validationMessage.style.display = 'block'
            validationMessage.innerHTML = 'Please Enter Valid Product Name';
            return false
        }else if (!/^[a-zA-Z\s]*$/.test(productName)) {
            validationMessage.style.display = 'block'
            validationMessage.innerHTML = 'Product Name can only contain letters and spaces';
            return false
        }

        
        if (!brandName || brandName[0]==' ') {
            validationMessage.style.display = 'block'
            validationMessage.innerHTML = 'Please Enter Valid Brand Name';
            return false
        }

        
        if (!model || model[0]==' ') {
            validationMessage.style.display = 'block'
            validationMessage.innerHTML = 'Please Enter Valid Model';
            return false
        }

        
        if (!dialColor || dialColor[0]==' ') {
            validationMessage.style.display = 'block'
            validationMessage.innerHTML = 'Enter Valid Dial Color';
            return false
        }

        
        if (!strapColor || strapColor[0]==' ') {
            validationMessage.style.display = 'block'
            validationMessage.innerHTML = 'Enter Valid Strap Color';
            return false
        }

        
        if (!inStock ||parseInt(inStock) < 0) {
            validationMessage.innerHTML = 'Enter Quantity of Products';
            return false
        }

        
        if (!mrp.trim().match(/^\d+$/)) {
            validationMessage.style.display = 'block'
            validationMessage.innerHTML = 'Enter Original Price';
            return false;
        }

        
        if (!discountPrice.trim().match(/^\d+$/)) {
            validationMessage.style.display = 'block'
            validationMessage.innerHTML = 'Enter Discount Price';
            return false;
        }

        if (parseInt(mrp) < parseInt(discountPrice)) {
            validationMessage.style.display = 'block'
            validationMessage.innerHTML = 'MRP cannot be less than Discount Price</p>';
            return false
        }


        return true; 
    }


// ! Category form validation >>

    function categoryFormValidation(){
        var categoryName = document.getElementById('categoryName').value;
        const validationMessage = document.getElementById('validationMessages')

            
            if (categoryName.trim() === '') {
                validationMessage.style.display = 'block'
                validationMessage.innerHTML = 'Please Enter Valid Category Name';
                return false;
            }else if (!/^[a-zA-Z\s]*$/.test(categoryName)) {
                validationMessage.style.display = 'block'
                validationMessage.innerHTML = 'Category Name can only contain letters and spaces';
                return false;
            }


            return true 

    }


//! coupen form validation >>
    function validateCoupenForm() {
        var message = document.getElementById('validationMessages');
        var discount = document.getElementById('discount').value;
        var minmPrchsAmt = document.getElementById('minmPrchsAmt').value;
        var maxRedimabelAmount = document.getElementById('maxRedimabelAmount').value;


        let couponCode = document.getElementById('copenCode').value.trim();  
        let codeRegex = /^[A-Za-z0-9]{5,10}$/;
        if (!codeRegex.test(couponCode) || couponCode[0]==' ') {
            message.style.display = 'block'
            message.textContent = "Coupon code must be 5-10 characters long and contain only letters and numbers.";
            return false;
        }
        if (!discount) {
            message.style.display = 'block'
            message.textContent = "Enter discount";
            return false;
        }else if(!minmPrchsAmt || minmPrchsAmt < 1 ){
            message.style.display = 'block'
            message.textContent = "Enter minimum purchase Amount ";
            return false;
        }else if(!maxRedimabelAmount || maxRedimabelAmount < 100){
            message.style.display = 'block'
            message.textContent = "Maximum Redible Amount must want greater than 100";
            return false;
        }

        let today = new Date();
        today.setHours(0, 0, 0, 0); 
        let expiredDate = new Date(document.getElementById('expiredDate').value);
        if (expiredDate <= today || !expiredDate) {
            message.style.display = 'block'
            message.textContent = "The expiration date must be a future date.";
            return false;
        }

        return true
    };


//! baanner validation
     function validateBanner(){
        const head = document.getElementById('header').value;
        const subHeader = document.getElementById('subHeader').value;
        const message = document.getElementById('responseMessage')

        if(head[0]===' ' || !head){
            message.style.display = 'block'
            message.innerText = 'Please Enter Valid Header'
            return false
        }else if(subHeader[0]===' ' || !subHeader){
            message.style.display = 'block'
            message.innerText = 'Please Enter Valid SubHeader'
            return false
        }
        return true

    }