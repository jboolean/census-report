require_relative 'dependencies'

$manifest = []

$added = {}

#get all the filenames buried in the list
DEPENDENCIES.each do |file, reqsList|
  $added[file] = false
  reqsList.each {|req| $added[req] = false}
end

def get_next
  $added.each do |file, isSeen|
    return file unless isSeen
  end
  nil
end

#now traverse the tree
def traverse(root)
  return nil if $added[root]

  deps = DEPENDENCIES[root]
  unless deps.nil? || deps == []
    deps.each do |child| 
      traverse(child)
    end   
  end

  $manifest.push(root)
  $added[root] = true
end

until (nextFile = get_next()).nil? do
  traverse(nextFile)
end

$cssManifest = []
$jsManifest = []
$manifest.each do |filename|
  if File.exist?(File.join('styles', filename+'.less'))
    $cssManifest.push(filename)
  end
  if File.exist?(File.join('scripts', filename+'.js'))
    $jsManifest.push(filename)
  else
    puts "WARN: file #{filename}.js not found"
  end
end

File.open("styles.manifest", "w") do |f|
  f.puts($cssManifest)
end
File.open("scripts.manifest", "w") do |f|
  f.puts($jsManifest)
end
