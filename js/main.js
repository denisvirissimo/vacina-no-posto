const fetchData = async () => {
    var url = 'http://localhost:9000/search';
    // var url = '/.netlify/functions/search';
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({'codigoUBS': '2788330'})
      });
      return response.json();
}

fetchData().then(data => {
    console.log(data);
});