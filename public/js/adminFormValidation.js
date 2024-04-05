
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



    function calculateDiscount() {
        var OriginalPriceInput = document.getElementById('mrp').value;
        var discountPriceInput = document.getElementById('discountPrice').value;
        
        var discountPrice = parseFloat(OriginalPriceInput);
        var OriginalPrice = parseFloat(discountPriceInput);
        
        
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

    
    function validateForm() {
        var productName = document.getElementById('productName').value;
        var brandName = document.getElementById('brandName').value;
        var model = document.getElementById('model').value;
        var dialColor = document.getElementById('dialColor').value;
        var strapColor = document.getElementById('strapColor').value;
        var inStock = document.getElementById('inStock').value;
        var mrp = document.getElementById('mrp').value;
        var discountPrice = document.getElementById('discountPrice').value;
        var validationMessages = document.getElementById('validationMessages');
        
        
        validationMessages.innerHTML = '';

        var isValid = true;

        
        if (productName.trim() === '') {
            validationMessages.innerHTML += '<p>Please Enter Valid Product Name</p>';
            isValid = false;
            return isValid
        }else if (!/^[a-zA-Z\s]*$/.test(productName)) {
            validationMessages.innerHTML += '<p>Product Name can only contain letters and spaces</p>';
            isValid = false;
            return isValid
        }

        
        if (brandName.trim() === '') {
            validationMessages.innerHTML += '<p>Please Enter Valid Brand Name</p>';
            isValid = false
            return isValid
        }

        
        if (model.trim() === '') {
            validationMessages.innerHTML += '<p>Please Enter Valid Model</p>';
            isValid = false
            return isValid
        }

        
        if (dialColor.trim() === '') {
            validationMessages.innerHTML += '<p>Enter Valid Dial Color</p>';
            isValid = false
            return isValid
        }

        
        if (strapColor.trim() === '') {
            validationMessages.innerHTML += '<p>Enter Valid Strap Color</p>';
            isValid = false
            return isValid
        }

        
        if (inStock.trim() === ''||parseInt(inStock) < 0) {
            validationMessages.innerHTML += '<p>Enter Quantity of Products</p>';
            isValid = false;
            return isValid
        }

        
        if (!mrp.trim().match(/^\d+$/)) {
            validationMessages.innerHTML += '<p>Enter Original Price</p>';
            isValid = false;
            return isValid;
        }

        
        if (!discountPrice.trim().match(/^\d+$/)) {
            validationMessages.innerHTML += '<p>Enter Discount Price</p>';
            isValid = false;
            return isValid;
        }

        if (parseInt(mrp) < parseInt(discountPrice)) {
            validationMessages.innerHTML += '<p>MRP cannot be less than Discount Price</p>';
            isValid = false;
            return isValid
        }


        return isValid; 
    }