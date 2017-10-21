import os

cwd = os.getcwd()
htmlFile = open(os.path.join(cwd,'dbMenu.txt'),'r')
htmlFileStr = htmlFile.read()
htmlFile.close()
length = len(htmlFileStr)
print('File length: ' + str(length) + ' chars')
sourceDir = os.path.join(os.path.split(cwd)[0], 'MITProxyCrEx_Package')
outFile = open(os.path.join(sourceDir,'database.js'), 'w')
outFile.write('const urlDb = [\n') 
searchStr = 'login?url='
num = len(searchStr)
i = 0
count = 0
outList = set()
print('Parsing File...')
while True:
    outTxt = ''
    i = htmlFileStr.find(searchStr, i)
    if i < 0:
        break
    i += num
    # perc = str(int(i/length * 1000) / 10)
    while True:
        char = htmlFileStr[i]
        if (char == '\"') or (char == '<'):
            break
        outTxt += char
        i += 1
    if outTxt == '':
        continue
    if outTxt.find('://') >= 0:
        outTxt = outTxt[(outTxt.find('://') + 3):]
    if outTxt.find('/') >= 0:
        outTxt = outTxt[:outTxt.find('/')]
    splitArr = outTxt.split('.')
    if 'www' in splitArr[0]:
        del splitArr[0]
    outTxt = '.'.join(splitArr)
    count += 1
    outList.add(outTxt.lower())
    # couStr = str(count);
    # print('0' * (4 - len(couStr)) + couStr + ' - ' + '0' * (4 - len(perc)) + perc + ' % -> ' + outTxt)

# FIXME - should removeList be a set?
removeList = ['against-the-grain.com',
              'netflix.com',
              'theatlantic.com',
              'forbes.com']
for item in removeList:
    if item not in outList:
        print('WARNING: \'' + item + '\' is not in the list and cannot be removed.')
extendList = set(['scholar.google.com'])
outList = [r for r in outList | extendList if r not in removeList]
print("Done.")


print("Sorting...")
outList = sorted(outList, key=str.lower)
print("Done.")


print("Writing database.js...")
for item in outList[:(len(outList) - 1)]:
    outFile.write('\"' + item + '\",\n')
outFile.write('\"' + outList[-1] + '\"\n')
outFile.write('];\n')
outFile.close()
print('Done.')


print("Writing filters.js...")
outFile = open(os.path.join(sourceDir,'filters.js'), 'w')
outFile.write('const urlFilters = { url: [\n')
for item in outList[:(len(outList) - 1)]:
    outFile.write('{hostSuffix: \"' + item + '\"},\n')
outFile.write('{hostSuffix: \"' + item + '\"}\n')
outFile.write(']};\n')
outFile.close()
print('Done.')
