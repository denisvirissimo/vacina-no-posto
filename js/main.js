const fetchData = async () => {
    
    const response = await fetch('http://localhost:9000/search', {
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
    // await (await fetch('http://localhost:9000/search')).json();
    // await (await fetch('/.netlify/functions/search')).json();

fetchData().then(data => {
    console.log(data);
});