export class Html {
  public static readonly page = `
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Music sharing helper</title>
    <meta name="description" content="Share your favorite songs accross streaming services!">
    <meta property="og:title" content="Share helper">
    <meta property="og:type" content="website">

    <link rel="stylesheet" href="css/styles.css?v=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
</head>

<body>
    <div class="container">
        <div class="row">
            <div class="col mt-3">
                <h1>Share Helper</h1>
            </div>
        </div>
        <div class="row">
            <form method="post" action="/" target="_self">
                <div class="mb-3">
                    <label for="sharedUrl" class="form-label">Track url</label>
                    <input type="url" class="form-control" id="sharedUrl" name="sharedUrl" aria-describedby="urlHelp">
                    <div id="urlHelp" class="form-text">Simply paste the link generated from your streaming app (Spotify, Deezer, ...) above.</div>
                </div>
                <button type="submit" class="btn btn-primary">Convert</button>
            </form>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
        crossorigin="anonymous"></script>
</body>
</html>  
  `
}